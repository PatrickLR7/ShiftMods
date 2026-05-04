from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.services import rate_limit_service


def rate_limit(endpoint: str, limit: int):
    """Factory that returns a FastAPI dependency enforcing a per-user daily rate limit."""

    async def _check(
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db),
    ) -> None:
        if current_user.role == "admin":
            return
        await rate_limit_service.check_and_increment(db, current_user.id, endpoint, limit)

    return _check
