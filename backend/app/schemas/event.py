from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict

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
