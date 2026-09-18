from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class EventBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: str | None = None
    start_time: datetime
    end_time: datetime


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    name: str | None = Field(None, max_length=255)
    description: str | None = None
    start_time: datetime | None = None
    end_time: datetime | None = None


class EventOut(EventBase):
    id: UUID
    created_by: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EventDetailOut(EventOut):
    """Event with live counters for the dynamic frontend."""

    challenge_count: int = 0
    total_points: int = 0
    participant_count: int = 0
    is_registered: bool = False
    is_ongoing: bool = False
