import uuid
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    challenge_id = Column(
        UUID(as_uuid=True),
        ForeignKey("challenges.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    submitted_flag = Column(String(512), nullable=False)
    is_correct = Column(Boolean, nullable=False, default=False)
    points_awarded = Column(Integer, nullable=False, default=0)

    submitted_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    challenge = relationship("Challenge", back_populates="submissions")
    user = relationship("User")

    __table_args__ = (
        UniqueConstraint(
            "challenge_id", "user_id", "is_correct", name="uq_submission_correct_once"
        ),
    )
