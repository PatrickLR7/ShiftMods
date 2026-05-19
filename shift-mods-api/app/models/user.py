import uuid
from sqlalchemy import CheckConstraint, Text, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.dialects.postgresql import TIMESTAMP as TIMESTAMPTZ
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        CheckConstraint("role IN ('user', 'admin')", name="users_role_check"),
        {"schema": "shift-mods"},
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    email: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(Text, nullable=False)
    role: Mapped[str] = mapped_column(Text, nullable=False, server_default="user")
    created_at: Mapped[str] = mapped_column(
        TIMESTAMPTZ, nullable=False, server_default=text("now()")
    )
    updated_at: Mapped[str] = mapped_column(
        TIMESTAMPTZ, nullable=False, server_default=text("now()")
    )
