from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.car_profile import UserCarProfile
from app.models.user import User
from app.schemas.auth import UserResponse
from app.schemas.car_profile import CarProfileRequest, CarProfileResponse

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/me/car-profile", response_model=CarProfileResponse | None)
async def get_car_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(UserCarProfile).where(UserCarProfile.user_id == current_user.id)
    )
    return result.scalar_one_or_none()


@router.put("/me/car-profile", response_model=CarProfileResponse)
async def upsert_car_profile(
    body: CarProfileRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(UserCarProfile).where(UserCarProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()

    if profile is None:
        profile = UserCarProfile(user_id=current_user.id)
        db.add(profile)

    profile.make = body.make
    profile.model = body.model
    profile.year = body.year
    profile.trim = body.trim
    profile.goal = body.goal.value
    profile.notes = body.notes
    profile.updated_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(profile)
    return profile
