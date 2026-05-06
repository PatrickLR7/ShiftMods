from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.dependencies.rate_limit import rate_limit
from app.models.car_profile import UserCarProfile
from app.models.rate_limit import RateLimit
from app.models.user import User
from app.schemas.recommendation import RecommendationRequest, RecommendationResponse
from app.services import gemini_service

router = APIRouter(prefix="/ai", tags=["ai"])

DAILY_RECOMMEND_LIMIT = 10


@router.get("/recommend/quota")
async def get_recommendation_quota(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role == "admin":
        return {"used": 0, "limit": None, "remaining": None, "is_admin": True}

    result = await db.execute(
        select(RateLimit).where(
            RateLimit.user_id == current_user.id,
            RateLimit.endpoint == "ai.recommend",
            RateLimit.date == date.today(),
        )
    )
    row = result.scalar_one_or_none()
    used = row.count if row else 0
    return {
        "used": used,
        "limit": DAILY_RECOMMEND_LIMIT,
        "remaining": max(0, DAILY_RECOMMEND_LIMIT - used),
        "is_admin": False,
    }


@router.post(
    "/recommend",
    response_model=RecommendationResponse,
    dependencies=[Depends(rate_limit("ai.recommend", DAILY_RECOMMEND_LIMIT))],
)
async def recommend(
    body: RecommendationRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(UserCarProfile).where(UserCarProfile.user_id == current_user.id)
    )
    car_profile = result.scalar_one_or_none()

    if car_profile is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please set up your car profile before requesting recommendations.",
        )

    return await gemini_service.get_recommendations(car_profile, body.budget_usd)
