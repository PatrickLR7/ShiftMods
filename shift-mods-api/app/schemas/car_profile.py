import uuid
from datetime import datetime
from enum import Enum

from pydantic import BaseModel


class BuildGoal(str, Enum):
    track_performance = "track_performance"
    daily_driver = "daily_driver"
    off_road = "off_road"
    visual_build = "visual_build"
    general = "general"


class CarProfileRequest(BaseModel):
    make: str
    model: str
    year: int
    trim: str | None = None
    goal: BuildGoal = BuildGoal.general
    notes: str | None = None


class CarProfileResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    make: str
    model: str
    year: int
    trim: str | None
    goal: str
    notes: str | None
    updated_at: datetime

    model_config = {"from_attributes": True}
