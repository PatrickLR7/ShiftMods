import uuid
from datetime import timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import require_admin
from app.models.invite import Invite
from app.models.user import User
from app.schemas.invite import CreateInviteRequest, InviteResponse
from app.services.invite_service import generate_invite

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(require_admin)],
)


@router.post("/invites", response_model=InviteResponse, status_code=status.HTTP_201_CREATED)
async def create_invite(
    body: CreateInviteRequest,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    invite = await generate_invite(db, current_user.id, body.expires_in_days)
    return invite


@router.get("/invites", response_model=list[InviteResponse])
async def list_invites(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Invite).order_by(Invite.created_at.desc()))
    return result.scalars().all()


@router.delete("/invites/{invite_id}", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_invite(invite_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Invite).where(Invite.id == invite_id))
    invite = result.scalar_one_or_none()

    if invite is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invite not found")

    if invite.used_by is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot revoke an invite that has already been used",
        )

    await db.delete(invite)
    await db.commit()
