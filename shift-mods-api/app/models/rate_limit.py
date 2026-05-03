import uuid
from sqlalchemy import Date, ForeignKey, Integer, Text, UniqueConstraint, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class RateLimit(Base):
    __tablename__ = "rate_limits"
    __table_args__ = (
        UniqueConstraint("user_id", "endpoint", "date", name="rate_limits_user_endpoint_date_key"),
        {"schema": "shift-mods"},
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("shift-mods.users.id", ondelete="CASCADE"),
        nullable=False,
    )
    endpoint: Mapped[str] = mapped_column(Text, nullable=False)
    date: Mapped[str] = mapped_column(Date, nullable=False, server_default=text("CURRENT_DATE"))
    count: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")
