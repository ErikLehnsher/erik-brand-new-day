from datetime import datetime

from typing import Literal

from pydantic import BaseModel, Field


class PostSummary(BaseModel):
    id: str
    slug: str
    title: str
    excerpt: str
    category: str
    cover_image_url: str | None = None
    video_url: str | None = None
    published_at: datetime | None
    created_at: datetime


class PostDetail(PostSummary):
    content: str
    status: str


class CreatePostRequest(BaseModel):
    slug: str = Field(min_length=3, max_length=255)
    title: str = Field(min_length=3, max_length=255)
    excerpt: str = Field(min_length=20)
    content: str = Field(min_length=20)
    category: Literal["daily", "odoo", "technology", "video"] = "daily"
    cover_image_url: str | None = Field(default=None, max_length=4000)
    video_url: str | None = Field(default=None, max_length=4000)
    status: str = Field(default="draft")
