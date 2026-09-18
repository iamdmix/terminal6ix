import os
from datetime import datetime, timedelta

from dotenv import load_dotenv
from jose import jwt
from passlib.context import CryptContext

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError(
        "SECRET_KEY environment variable is not set. "
        "Generate one with: python -c \"import secrets; print(secrets.token_hex(32))\""
    )

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRY_HOURS = int(os.getenv("ACCESS_TOKEN_EXPIRY_HOURS", "12"))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(password, hashed)


def create_access_token(data: dict, role: str | None = None) -> str:
    """Create JWT token. Expiry defaults to ACCESS_TOKEN_EXPIRY_HOURS."""
    expires_delta = timedelta(hours=ACCESS_TOKEN_EXPIRY_HOURS)

    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
