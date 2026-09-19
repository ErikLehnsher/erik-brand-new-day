from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.core.email import ConsoleEmailSender, EmailMessage
from app.domains.publication.service import ensure_profile
from app.core.security import create_access_token, create_reset_token
from app.models.reset_token import PasswordResetToken
from app.models.user import User
from app.schemas.auth import (
    AuthResponse,
    AuthUser,
    GoogleLoginRequest,
    LoginRequest,
    PasswordResetConfirmRequest,
    PasswordResetRequest,
    RegisterRequest,
)

router = APIRouter(prefix="/auth", tags=["auth"])
email_sender = ConsoleEmailSender()


def serialize_user(user: User) -> AuthUser:
    return AuthUser(
        id=user.id,
        email=user.email,
        display_name=user.email.split("@", 1)[0],
    )


@router.post("/register", response_model=AuthResponse)
async def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> AuthResponse:
    existing_user = db.scalar(select(User).where(User.email == payload.email.lower()))
    if existing_user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered. Please sign in instead.")
    user = User(email=payload.email.lower(), is_admin=not bool(db.scalar(select(User.id).limit(1))))
    from app.core.security import hash_password

    user.password_hash = hash_password(payload.password)
    db.add(user)
    db.commit()
    db.refresh(user)
    ensure_profile(db, user)
    db.commit()
    return AuthResponse(access_token=create_access_token(user.id), user=serialize_user(user))


@router.post("/login", response_model=AuthResponse)
async def login(payload: LoginRequest, db: Session = Depends(get_db)) -> AuthResponse:
    user = db.scalar(select(User).where(User.email == payload.email.lower()))
    from app.core.security import verify_password

    if not user or not user.password_hash or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Email or password is incorrect")
    ensure_profile(db, user)
    db.commit()
    return AuthResponse(access_token=create_access_token(user.id), user=serialize_user(user))


@router.post("/google", response_model=AuthResponse)
async def google_login(payload: GoogleLoginRequest, db: Session = Depends(get_db)) -> AuthResponse:
    user = db.scalar(select(User).where(User.email == payload.email.lower()))
    if user is None:
        user = User(email=payload.email.lower(), google_sub=payload.google_sub, is_admin=not bool(db.scalar(select(User.id).limit(1))))
        db.add(user)
    else:
        user.google_sub = payload.google_sub
    db.commit()
    db.refresh(user)
    ensure_profile(db, user)
    db.commit()
    return AuthResponse(access_token=create_access_token(user.id), user=serialize_user(user))


@router.post("/logout")
async def logout() -> dict[str, str]:
    return {"status": "ok"}


@router.post("/password-reset/request")
async def password_reset_request(payload: PasswordResetRequest, db: Session = Depends(get_db)) -> dict[str, str]:
    user = db.scalar(select(User).where(User.email == payload.email.lower()))
    if user is None:
        return {"status": "ok"}

    token = create_reset_token(user.id)
    reset_token = PasswordResetToken(user_id=user.id, token=token)
    db.add(reset_token)
    db.commit()
    await email_sender.send(
        EmailMessage(
            to=user.email,
            subject="Reset your password",
            body=f"Use this token to reset your password: {token}",
        )
    )
    return {"status": "ok"}


@router.post("/password-reset/confirm")
async def password_reset_confirm(payload: PasswordResetConfirmRequest, db: Session = Depends(get_db)) -> dict[str, str]:
    if not payload.token:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing token")

    reset_token = db.scalar(select(PasswordResetToken).where(PasswordResetToken.token == payload.token))
    if not reset_token:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token")

    user = db.get(User, reset_token.user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token")

    from app.core.security import hash_password

    user.password_hash = hash_password(payload.new_password)
    db.delete(reset_token)
    db.commit()

    return {"status": "ok"}
