import uuid
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.invite import Invite


async def generate_invite(
    db: AsyncSession,
    created_by_user_id: uuid.UUID,
    expires_in_days: int | None = 7,
) -> Invite:
    from datetime import timedelta

    expires_at = (
        datetime.now(timezone.utc) + timedelta(days=expires_in_days)
        if expires_in_days is not None
        else None
    )
    invite = Invite(created_by=created_by_user_id, expires_at=expires_at)
    db.add(invite)
    await db.commit()
    await db.refresh(invite)
    return invite


async def validate_and_consume_invite(
    db: AsyncSession,
    token: uuid.UUID,
    used_by_user_id: uuid.UUID,
) -> None:
    result = await db.execute(select(Invite).where(Invite.token == token))
    invite = result.scalar_one_or_none()

    if invite is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid invite token")

    if invite.used_by is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invite token already used")

    if invite.expires_at is not None:
        expires = invite.expires_at
        if expires.tzinfo is None:
            expires = expires.replace(tzinfo=timezone.utc)
        if datetime.now(timezone.utc) > expires:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invite token has expired")

    invite.used_by = used_by_user_id
    invite.used_at = datetime.now(timezone.utc)
    await db.commit()
