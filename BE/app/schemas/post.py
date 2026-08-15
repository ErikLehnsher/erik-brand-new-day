from datetime import datetime

from pydantic import BaseModel, Field


class PostSummary(BaseModel):
    id: str
    slug: str
    title: str
    excerpt: str
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
    status: str = Field(default="draft")
