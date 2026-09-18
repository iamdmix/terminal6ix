from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class RegistrationOut(BaseModel):
    id: UUID
    event_id: UUID
    user_id: UUID
    registered_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LeaderboardEntry(BaseModel):
    rank: int
    user_id: UUID
    user_name: str
    score: int
    solved_count: int
    last_solve_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
