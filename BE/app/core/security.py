from datetime import datetime, timedelta, timezone
from typing import Any

from jose import jwt
from passlib.context import CryptContext

from app.core.config import get_settings

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
settings = get_settings()

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24
RESET_TOKEN_EXPIRE_MINUTES = 30


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_token(payload: dict[str, Any], expires_delta: timedelta) -> str:
    now = datetime.now(timezone.utc)
    data = payload.copy()
    data.update({"exp": now + expires_delta, "iat": now})
    return jwt.encode(data, settings.secret_key, algorithm=ALGORITHM)


def create_access_token(subject: str) -> str:
    return create_token({"sub": subject, "type": "access"}, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))


def create_reset_token(subject: str) -> str:
    return create_token({"sub": subject, "type": "reset"}, timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES))
