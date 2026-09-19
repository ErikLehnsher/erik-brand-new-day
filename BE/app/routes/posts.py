from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.domains.publication.service import ensure_profile
from app.models.post import Post
from app.models.profile import Category, Profile
from app.models.user import User
from app.schemas.post import CreatePostRequest, PostDetail, PostSummary

router = APIRouter(prefix="/posts", tags=["posts"])


def to_summary(post: Post, db: Session) -> PostSummary:
    category = db.get(Category, post.category_id) if post.category_id else None
    profile = db.get(Profile, post.profile_id) if post.profile_id else None
    return PostSummary(
        id=post.id,
        slug=post.slug,
        title=post.title,
        excerpt=post.excerpt,
        category=category.name if category else post.category,
        category_slug=category.slug if category else post.category,
        author_handle=profile.handle if profile else None,
        cover_image_url=post.cover_image_url,
        video_url=post.video_url,
        published_at=post.published_at,
        created_at=post.created_at,
    )


def to_detail(post: Post, db: Session) -> PostDetail:
    return PostDetail(**to_summary(post, db).model_dump(), content=post.content, status=post.status)


@router.get("", response_model=list[PostSummary])
def list_posts(db: Session = Depends(get_db)) -> list[PostSummary]:
    posts = db.scalars(
        select(Post).where(Post.status == "published").order_by(Post.published_at.desc(), Post.created_at.desc())
    ).all()
    return [to_summary(post, db) for post in posts]


@router.get("/{slug}", response_model=PostDetail)
def get_post(slug: str, db: Session = Depends(get_db)) -> PostDetail:
    post = db.scalar(select(Post).where(Post.slug == slug))
    if post is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    return to_detail(post, db)


@router.post("", response_model=PostDetail, status_code=status.HTTP_201_CREATED)
def create_post(
    payload: CreatePostRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PostDetail:
    existing = db.scalar(select(Post).where(Post.slug == payload.slug))
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Slug already exists")

    profile = ensure_profile(db, current_user)
    category = db.scalar(select(Category).where(Category.profile_id == profile.id, Category.slug == payload.category))
    if category is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Choose a category from your profile first")

    now = datetime.now(timezone.utc)
    post = Post(
        slug=payload.slug,
        title=payload.title,
        excerpt=payload.excerpt,
        content=payload.content,
        category=category.slug,
        category_id=category.id,
        author_id=current_user.id,
        profile_id=profile.id,
        cover_image_url=payload.cover_image_url.strip() if payload.cover_image_url else None,
        video_url=payload.video_url.strip() if payload.video_url else None,
        status=payload.status,
        published_at=now if payload.status == "published" else None,
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return to_detail(post, db)
