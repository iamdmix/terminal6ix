import os
from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext

SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
ALGORITHM = "HS256"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(password, hashed)

def create_access_token(data: dict, role: str):
    """Create JWT token with expiry based on role."""
    if role == "participant":
        expires_delta = timedelta(hours=12)
    elif role == "organiser":
        expires_delta = timedelta(days=7)
    else:
        expires_delta = timedelta(minutes=60)  # fallback

    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
