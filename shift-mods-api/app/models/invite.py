import uuid
from sqlalchemy import ForeignKey, Text, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.dialects.postgresql import TIMESTAMP as TIMESTAMPTZ
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Invite(Base):
    __tablename__ = "invites"
    __table_args__ = {"schema": "shift-mods"}

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    token: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        unique=True,
        nullable=False,
        server_default=text("gen_random_uuid()"),
    )
    created_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("shift-mods.users.id"),
        nullable=False,
    )
    used_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("shift-mods.users.id"),
        nullable=True,
    )
    expires_at: Mapped[str | None] = mapped_column(TIMESTAMPTZ, nullable=True)
    created_at: Mapped[str] = mapped_column(
        TIMESTAMPTZ, nullable=False, server_default=text("now()")
    )
    used_at: Mapped[str | None] = mapped_column(TIMESTAMPTZ, nullable=True)
