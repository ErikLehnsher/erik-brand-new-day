from datetime import datetime

from pydantic import BaseModel, Field


class CreateReviewRequest(BaseModel):
    rating: int = Field(ge=1, le=5)
    body: str = Field(min_length=3, max_length=2000)


class ReviewResponse(BaseModel):
    id: str
    rating: int
    body: str
    author_name: str
    created_at: datetime


class ReviewSummary(BaseModel):
    count: int
    average_rating: float | None
    reviews: list[ReviewResponse]
