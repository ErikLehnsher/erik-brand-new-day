import httpx
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.config import get_settings
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.agent import AgentChatRequest, AgentChatResponse


router = APIRouter(prefix="/agent", tags=["agent"])


@router.post("/chat", response_model=AgentChatResponse)
async def chat_with_friday(
    payload: AgentChatRequest,
    user: User = Depends(get_current_user),
) -> AgentChatResponse:
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
