from datetime import datetime

from pydantic import BaseModel, Field


class ProfileResponse(BaseModel):
    handle: str
    display_name: str
    bio: str | None
    avatar_url: str | None
    default_theme: str
    theme_settings: dict
    visibility: str


class UpdateProfileRequest(BaseModel):
    handle: str | None = Field(default=None, min_length=3, max_length=64, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    display_name: str | None = Field(default=None, min_length=1, max_length=120)
    bio: str | None = Field(default=None, max_length=1000)
    avatar_url: str | None = Field(default=None, max_length=4000)
    visibility: str | None = Field(default=None, pattern=r"^(public|private)$")


class UpdateThemeRequest(BaseModel):
    default_theme: str = Field(min_length=3, max_length=40)
    theme_settings: dict = Field(default_factory=dict)


class CategoryResponse(BaseModel):
    id: str
    name: str
    slug: str
    description: str | None
    color: str | None
    sort_order: int


class CategoryRequest(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    slug: str = Field(min_length=1, max_length=80, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    description: str | None = Field(default=None, max_length=500)
    color: str | None = Field(default=None, max_length=20)
    sort_order: int = Field(default=0, ge=0)


class CollectionResponse(BaseModel):
    id: str
    title: str
    slug: str
    introduction: str | None
    cover_image_url: str | None
    theme_override: str | None
    theme_settings: dict
    visibility: str
    created_at: datetime


class CollectionRequest(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    slug: str = Field(min_length=1, max_length=100, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    introduction: str | None = Field(default=None, max_length=2000)
    cover_image_url: str | None = Field(default=None, max_length=4000)
    theme_override: str | None = Field(default=None, max_length=40)
    theme_settings: dict = Field(default_factory=dict)
    visibility: str = Field(default="public", pattern=r"^(public|private)$")
