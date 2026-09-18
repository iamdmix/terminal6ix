import enum
import uuid
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class ChallengeCategory(str, enum.Enum):
    web = "web"
    crypto = "crypto"
    reverse = "reverse"
    forensics = "forensics"
    pwn = "pwn"
    osint = "osint"
    misc = "misc"


class ChallengeDifficulty(str, enum.Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"
    insane = "insane"


class Challenge(Base):
    __tablename__ = "challenges"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(
        UUID(as_uuid=True),
        ForeignKey("events.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(Enum(ChallengeCategory), nullable=False, default=ChallengeCategory.misc)
    difficulty = Column(Enum(ChallengeDifficulty), nullable=False, default=ChallengeDifficulty.easy)
    points = Column(Integer, nullable=False, default=100)
    flag = Column(String(512), nullable=False)
    flag_hint = Column(String(512), nullable=True)
    attachment_url = Column(String(512), nullable=True)
    connection_url = Column(String(512), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    event = relationship("Event", backref="challenges")
    submissions = relationship(
        "Submission", back_populates="challenge", cascade="all, delete-orphan"
    )

    __table_args__ = (
        UniqueConstraint("event_id", "title", name="uq_challenge_event_title"),
    )
