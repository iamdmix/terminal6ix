import uuid
from sqlalchemy import Column, String, Enum
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import enum

class UserRole(str, enum.Enum):
    participant = "participant"
    organiser = "organiser"

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    phone = Column(String, unique=True, nullable=True, index=True)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False)
