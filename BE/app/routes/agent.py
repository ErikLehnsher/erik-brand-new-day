import hashlib
import secrets

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.dependencies import get_current_user, get_db
from app.models.friday_access import FridayAccess, FridayApiKey
from app.models.user import User
from app.schemas.agent import AgentChatRequest, AgentChatResponse
from app.schemas.friday_access import FridayAccessResponse, FridayKeyCreatedResponse, FridayKeyRequest, FridayKeyResponse


router = APIRouter(prefix="/agent", tags=["agent"])


def key_response(key: FridayApiKey) -> FridayKeyResponse:
    return FridayKeyResponse(id=key.id, label=key.label, prefix=key.prefix, status=key.status, created_at=key.created_at, last_used_at=key.last_used_at)


def access_response(access: FridayAccess | None, keys: list[FridayApiKey]) -> FridayAccessResponse:
    return FridayAccessResponse(
        status=access.status if access else None,
        hourly_limit_minutes=access.hourly_limit_minutes if access else None,
        window_used_seconds=access.window_used_seconds if access else 0,
        requested_at=access.requested_at if access else None,
        approved_at=access.approved_at if access else None,
        admin_note=access.admin_note if access else None,
        keys=[key_response(key) for key in keys],
    )


@router.get("/access", response_model=FridayAccessResponse)
def get_friday_access(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> FridayAccessResponse:
    access = db.scalar(select(FridayAccess).where(FridayAccess.user_id == user.id))
    keys = db.scalars(select(FridayApiKey).where(FridayApiKey.user_id == user.id).order_by(FridayApiKey.created_at.desc())).all()
    return access_response(access, list(keys))


@router.post("/access/request", response_model=FridayAccessResponse)
def request_friday_access(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> FridayAccessResponse:
    access = db.scalar(select(FridayAccess).where(FridayAccess.user_id == user.id))
    if not access:
        access = FridayAccess(user_id=user.id, status="pending")
        db.add(access)
        db.commit()
        db.refresh(access)
    keys = db.scalars(select(FridayApiKey).where(FridayApiKey.user_id == user.id).order_by(FridayApiKey.created_at.desc())).all()
    return access_response(access, list(keys))


@router.post("/keys", response_model=FridayKeyCreatedResponse, status_code=status.HTTP_201_CREATED)
def create_friday_key(payload: FridayKeyRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> FridayKeyCreatedResponse:
    access = db.scalar(select(FridayAccess).where(FridayAccess.user_id == user.id))
    if not access or access.status != "approved":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Friday access must be approved before creating an API key.")
    secret = f"friday_{secrets.token_urlsafe(32)}"
    key = FridayApiKey(user_id=user.id, label=payload.label.strip(), prefix=secret[:18], secret_hash=hashlib.sha256(secret.encode()).hexdigest())
    db.add(key)
    db.commit()
    db.refresh(key)
    return FridayKeyCreatedResponse(**key_response(key).model_dump(), api_key=secret)


@router.delete("/keys/{key_id}", status_code=status.HTTP_204_NO_CONTENT)
def revoke_friday_key(key_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> None:
    key = db.scalar(select(FridayApiKey).where(FridayApiKey.id == key_id, FridayApiKey.user_id == user.id))
    if not key:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="API key not found")
    key.status = "revoked"
    db.commit()


@router.post("/chat", response_model=AgentChatResponse)
async def chat_with_friday(
    payload: AgentChatRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AgentChatResponse:
    access = db.scalar(select(FridayAccess).where(FridayAccess.user_id == user.id))
    if not access or access.status != "approved":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Friday access has not been approved yet.")
    settings = get_settings()
    if not settings.friday_bridge_url or not settings.friday_bridge_token:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Friday is not configured for this site yet.",
        )
    try:
        async with httpx.AsyncClient(timeout=settings.friday_bridge_timeout_seconds) as client:
            response = await client.post(
                f"{settings.friday_bridge_url.rstrip('/')}/v1/chat",
                headers={"X-Friday-Bridge-Token": settings.friday_bridge_token},
                json={"user_id": user.id, "prompt": payload.prompt},
            )
    except httpx.HTTPError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Friday is temporarily unavailable.",
        ) from None
    if response.status_code >= 400:
        detail = response.json().get("detail", "Friday could not complete that request.")
        raise HTTPException(status_code=response.status_code, detail=detail)
    data = response.json()
    return AgentChatResponse(answer=str(data["answer"]), engine=str(data["engine"]), session=str(data["session"]))
