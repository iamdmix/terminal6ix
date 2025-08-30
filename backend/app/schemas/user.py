from pydantic import BaseModel, EmailStr
from uuid import UUID
from enum import Enum

class UserRole(str, Enum):
    participant = "participant"
    organiser = "organiser"

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str | None = None
    password: str
    role: UserRole

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: UUID
    name: str
    email: EmailStr
    role: UserRole

    model_config = {
        "from_attributes": True  # replaces orm_mode in Pydantic v2
    }
