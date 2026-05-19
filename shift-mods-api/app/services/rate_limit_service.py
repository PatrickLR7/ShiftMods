import uuid
from datetime import date

from fastapi import HTTPException, status
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings

# Raw SQL for atomic upsert — SQLAlchemy ORM has no clean cross-db upsert primitive
_UPSERT_SQL = text("""
    INSERT INTO "shift-mods".rate_limits (user_id, endpoint, date, count)
    VALUES (:user_id, :endpoint, :date, 1)
    ON CONFLICT (user_id, endpoint, date)
    DO UPDATE SET count = "shift-mods".rate_limits.count + 1
    RETURNING count
""")


async def check_and_increment(
    db: AsyncSession,
    user_id: uuid.UUID,
    endpoint: str,
    daily_limit: int,
) -> None:
    result = await db.execute(
        _UPSERT_SQL,
        {"user_id": str(user_id), "endpoint": endpoint, "date": date.today()},
    )
    await db.commit()
    count = result.scalar_one()
    if count > daily_limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="You've used all your recommendations for today. Come back tomorrow!",
        )
