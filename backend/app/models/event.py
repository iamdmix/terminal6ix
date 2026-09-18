from datetime import datetime
from uuid import uuid4
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base

class Event(Base):
    __tablename__ = "events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    # Flag prefix for this event, e.g. "T6{" or "dad{". Submissions must start with it when set.
    flag_format = Column(String(32), nullable=True)

    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    creator = relationship("User", backref="events")

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
