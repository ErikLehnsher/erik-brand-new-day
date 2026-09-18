from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.models.post import Post
from app.models.review import Review
from app.models.user import User
from app.schemas.review import CreateReviewRequest, ReviewResponse, ReviewSummary

router = APIRouter(prefix="/posts", tags=["reviews"])


def serialize_review(review: Review, user: User) -> ReviewResponse:
    return ReviewResponse(
        id=review.id,
        rating=review.rating,
        body=review.body,
        author_name=user.email.split("@", 1)[0],
        created_at=review.created_at,
    )


def get_post_or_404(slug: str, db: Session) -> Post:
    post = db.scalar(select(Post).where(Post.slug == slug))
    if post is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    return post


@router.get("/{slug}/reviews", response_model=ReviewSummary)
def list_reviews(slug: str, db: Session = Depends(get_db)) -> ReviewSummary:
    post = get_post_or_404(slug, db)
    rows = db.execute(
        select(Review, User).join(User, Review.user_id == User.id).where(Review.post_id == post.id).order_by(Review.created_at.desc())
    ).all()
    average = db.scalar(select(func.avg(Review.rating)).where(Review.post_id == post.id))
    return ReviewSummary(
        count=len(rows),
        average_rating=round(float(average), 1) if average is not None else None,
        reviews=[serialize_review(review, user) for review, user in rows],
    )


@router.post("/{slug}/reviews", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_or_update_review(
    slug: str,
    payload: CreateReviewRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ReviewResponse:
    post = get_post_or_404(slug, db)
    review = db.scalar(select(Review).where(Review.post_id == post.id, Review.user_id == current_user.id))
    if review is None:
        review = Review(post_id=post.id, user_id=current_user.id, rating=payload.rating, body=payload.body.strip())
        db.add(review)
    else:
        review.rating = payload.rating
        review.body = payload.body.strip()
    db.commit()
    db.refresh(review)
    return serialize_review(review, current_user)
