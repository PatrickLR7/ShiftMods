from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.dependencies.rate_limit import rate_limit
from app.models.car_profile import UserCarProfile
from app.models.user import User
from app.schemas.recommendation import RecommendationRequest, RecommendationResponse
from app.services import gemini_service

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post(
    "/recommend",
    response_model=RecommendationResponse,
    dependencies=[Depends(rate_limit("ai.recommend", 10))],
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
