from datetime import datetime
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ChallengeCategory(str, Enum):
    web = "web"
    crypto = "crypto"
    reverse = "reverse"
    forensics = "forensics"
    pwn = "pwn"
    osint = "osint"
    misc = "misc"


class ChallengeDifficulty(str, Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"
    insane = "insane"


class ChallengeBase(BaseModel):
    title: str = Field(..., max_length=255)
    description: str
    category: ChallengeCategory = ChallengeCategory.misc
    difficulty: ChallengeDifficulty = ChallengeDifficulty.easy
    points: int = Field(100, ge=1, le=10000)
    flag_hint: str | None = None
    attachment_url: str | None = None
    connection_url: str | None = None


class ChallengeCreate(ChallengeBase):
    flag: str = Field(..., min_length=1, max_length=512)


class ChallengeUpdate(BaseModel):
    title: str | None = Field(None, max_length=255)
    description: str | None = None
    category: ChallengeCategory | None = None
    difficulty: ChallengeDifficulty | None = None
    points: int | None = Field(None, ge=1, le=10000)
    flag: str | None = Field(None, min_length=1, max_length=512)
    flag_hint: str | None = None
    attachment_url: str | None = None
    connection_url: str | None = None
    is_active: bool | None = None


class ChallengeOut(ChallengeBase):
    """Public view of a challenge — never exposes the flag."""

    id: UUID
    event_id: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ChallengeAdminOut(ChallengeOut):
    """Organiser view that includes the flag."""

    flag: str
