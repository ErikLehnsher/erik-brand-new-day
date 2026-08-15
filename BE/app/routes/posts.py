from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.models.post import Post
from app.schemas.post import CreatePostRequest, PostDetail, PostSummary

router = APIRouter(prefix="/posts", tags=["posts"])


def to_summary(post: Post) -> PostSummary:
    return PostSummary(
        id=post.id,
        slug=post.slug,
        title=post.title,
        excerpt=post.excerpt,
        published_at=post.published_at,
        created_at=post.created_at,
    )


def to_detail(post: Post) -> PostDetail:
    return PostDetail(**to_summary(post).model_dump(), content=post.content, status=post.status)


@router.get("", response_model=list[PostSummary])
def list_posts(db: Session = Depends(get_db)) -> list[PostSummary]:
    posts = db.scalars(
        select(Post).where(Post.status == "published").order_by(Post.published_at.desc(), Post.created_at.desc())
    ).all()
    return [to_summary(post) for post in posts]


@router.get("/{slug}", response_model=PostDetail)
def get_post(slug: str, db: Session = Depends(get_db)) -> PostDetail:
    post = db.scalar(select(Post).where(Post.slug == slug))
    if post is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    return to_detail(post)


@router.post("", response_model=PostDetail, status_code=status.HTTP_201_CREATED)
def create_post(payload: CreatePostRequest, db: Session = Depends(get_db)) -> PostDetail:
    existing = db.scalar(select(Post).where(Post.slug == payload.slug))
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Slug already exists")

    now = datetime.now(timezone.utc)
    post = Post(
        slug=payload.slug,
        title=payload.title,
        excerpt=payload.excerpt,
        content=payload.content,
        status=payload.status,
        published_at=now if payload.status == "published" else None,
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return to_detail(post)
