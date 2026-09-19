from datetime import datetime

from pydantic import BaseModel, Field


class FridayKeyRequest(BaseModel):
    label: str = Field(min_length=1, max_length=80)


class FridayKeyResponse(BaseModel):
    id: str
    label: str
    prefix: str
    status: str
    created_at: datetime
    last_used_at: datetime | None


class FridayKeyCreatedResponse(FridayKeyResponse):
    api_key: str


class FridayAccessResponse(BaseModel):
    status: str | None
    hourly_limit_minutes: int | None
    window_used_seconds: int
    requested_at: datetime | None
    approved_at: datetime | None
    admin_note: str | None
    is_admin: bool = False
    keys: list[FridayKeyResponse]


class FridayAdminAccessResponse(BaseModel):
    user_id: str
    email: str
    status: str
    hourly_limit_minutes: int
    requested_at: datetime
    approved_at: datetime | None
    admin_note: str | None


class FridayAdminDecisionRequest(BaseModel):
    status: str = Field(pattern=r"^(approved|revoked)$")
    hourly_limit_minutes: int = Field(default=30, ge=1, le=60)
    admin_note: str | None = Field(default=None, max_length=500)
