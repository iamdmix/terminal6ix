from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class SubmissionCreate(BaseModel):
    flag: str


class SubmissionOut(BaseModel):
    id: UUID
    challenge_id: UUID
    user_id: UUID
    submitted_flag: str
    is_correct: bool
    points_awarded: int
    submitted_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SolveOut(BaseModel):
    """A correct solve by the current user, for progress tracking."""

    id: UUID
    challenge_id: UUID
    points_awarded: int
    submitted_at: datetime

    model_config = ConfigDict(from_attributes=True)
