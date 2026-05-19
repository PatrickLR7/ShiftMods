import uuid
from datetime import datetime

from pydantic import BaseModel, computed_field

from app.config import settings


class CreateInviteRequest(BaseModel):
    expires_in_days: int = 7


class InviteResponse(BaseModel):
    id: uuid.UUID
    token: uuid.UUID
    expires_at: datetime | None
    used_at: datetime | None
    created_at: datetime

    @computed_field
    @property
    def invite_url(self) -> str:
        base = settings.ALLOWED_ORIGINS.split(",")[0].strip()
        return f"{base}/register?invite={self.token}"

    @computed_field
    @property
    def is_used(self) -> bool:
        return self.used_at is not None

    @computed_field
    @property
    def is_expired(self) -> bool:
        if self.expires_at is None:
            return False
        from datetime import timezone
        expires = self.expires_at
        if expires.tzinfo is None:
            expires = expires.replace(tzinfo=timezone.utc)
        return datetime.now(timezone.utc) > expires

    model_config = {"from_attributes": True}
