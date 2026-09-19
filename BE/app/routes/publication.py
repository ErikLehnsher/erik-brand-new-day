from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.domains.publication.service import THEME_IDS, THEME_PRESETS, ensure_profile, sanitize_theme_settings
from app.models.profile import Category, Collection, Profile
from app.models.post import Post
from app.models.user import User
from app.schemas.publication import (
    CategoryRequest,
    CategoryResponse,
    CollectionRequest,
    CollectionResponse,
    ProfileResponse,
    UpdateProfileRequest,
    UpdateThemeRequest,
)
from app.schemas.post import PostSummary

public_router = APIRouter(prefix="/profiles", tags=["profiles"])
studio_router = APIRouter(prefix="/studio", tags=["studio"])


def profile_response(profile: Profile) -> ProfileResponse:
    return ProfileResponse(
        handle=profile.handle, display_name=profile.display_name, bio=profile.bio, avatar_url=profile.avatar_url,
        default_theme=profile.default_theme, theme_settings=profile.theme_settings or {}, visibility=profile.visibility,
    )


def category_response(category: Category) -> CategoryResponse:
    return CategoryResponse(**{field: getattr(category, field) for field in CategoryResponse.model_fields})


def collection_response(collection: Collection) -> CollectionResponse:
    return CollectionResponse(
        id=collection.id, title=collection.title, slug=collection.slug, introduction=collection.introduction,
        cover_image_url=collection.cover_image_url, theme_override=collection.theme_override,
        theme_settings=collection.theme_settings or {}, visibility=collection.visibility, created_at=collection.created_at,
    )


def post_summary(post: Post, category: Category | None, profile: Profile) -> PostSummary:
    return PostSummary(
        id=post.id, slug=post.slug, title=post.title, excerpt=post.excerpt,
        category=category.name if category else post.category, category_slug=category.slug if category else post.category,
        author_handle=profile.handle, cover_image_url=post.cover_image_url, video_url=post.video_url,
        published_at=post.published_at, created_at=post.created_at,
    )


def get_current_profile(db: Session, user: User) -> Profile:
    profile = ensure_profile(db, user)
    db.commit()
    db.refresh(profile)
    return profile


@public_router.get("/{handle}", response_model=ProfileResponse)
def get_profile(handle: str, db: Session = Depends(get_db)) -> ProfileResponse:
    profile = db.scalar(select(Profile).where(Profile.handle == handle, Profile.visibility == "public"))
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    return profile_response(profile)


@public_router.get("/{handle}/categories", response_model=list[CategoryResponse])
def list_profile_categories(handle: str, db: Session = Depends(get_db)) -> list[CategoryResponse]:
    profile = db.scalar(select(Profile).where(Profile.handle == handle, Profile.visibility == "public"))
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    return [category_response(category) for category in db.scalars(select(Category).where(Category.profile_id == profile.id).order_by(Category.sort_order, Category.name)).all()]


@public_router.get("/{handle}/collections", response_model=list[CollectionResponse])
def list_profile_collections(handle: str, db: Session = Depends(get_db)) -> list[CollectionResponse]:
    profile = db.scalar(select(Profile).where(Profile.handle == handle, Profile.visibility == "public"))
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    collections = db.scalars(select(Collection).where(Collection.profile_id == profile.id, Collection.visibility == "public").order_by(Collection.created_at.desc())).all()
    return [collection_response(collection) for collection in collections]


@public_router.get("/{handle}/posts", response_model=list[PostSummary])
def list_profile_posts(handle: str, db: Session = Depends(get_db)) -> list[PostSummary]:
    profile = db.scalar(select(Profile).where(Profile.handle == handle, Profile.visibility == "public"))
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    posts = db.scalars(select(Post).where(Post.profile_id == profile.id, Post.status == "published").order_by(Post.published_at.desc(), Post.created_at.desc())).all()
    categories = {category.id: category for category in db.scalars(select(Category).where(Category.profile_id == profile.id)).all()}
    return [post_summary(post, categories.get(post.category_id), profile) for post in posts]


@public_router.get("/{handle}/categories/{slug}/posts", response_model=list[PostSummary])
def list_category_posts(handle: str, slug: str, db: Session = Depends(get_db)) -> list[PostSummary]:
    profile = db.scalar(select(Profile).where(Profile.handle == handle, Profile.visibility == "public"))
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    category = db.scalar(select(Category).where(Category.profile_id == profile.id, Category.slug == slug))
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    posts = db.scalars(select(Post).where(Post.profile_id == profile.id, Post.category_id == category.id, Post.status == "published").order_by(Post.published_at.desc(), Post.created_at.desc())).all()
    return [post_summary(post, category, profile) for post in posts]


@studio_router.get("/profile", response_model=ProfileResponse)
def get_studio_profile(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> ProfileResponse:
    return profile_response(get_current_profile(db, user))


@studio_router.put("/profile", response_model=ProfileResponse)
def update_studio_profile(payload: UpdateProfileRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> ProfileResponse:
    profile = get_current_profile(db, user)
    if payload.handle and payload.handle != profile.handle:
        if db.scalar(select(Profile.id).where(Profile.handle == payload.handle)):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Handle already exists")
        profile.handle = payload.handle
    for field in ("display_name", "bio", "avatar_url", "visibility"):
        value = getattr(payload, field)
        if value is not None:
            setattr(profile, field, value.strip() if isinstance(value, str) else value)
    db.commit()
    db.refresh(profile)
    return profile_response(profile)


@studio_router.get("/themes")
def list_theme_presets() -> dict:
    return {"themes": THEME_PRESETS, "allowed_settings": sorted(sanitize_theme_settings({key: True for key in ["accent_color", "background_color", "heading_font", "body_font", "card_style", "density"]}))}


@studio_router.put("/theme", response_model=ProfileResponse)
def update_theme(payload: UpdateThemeRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> ProfileResponse:
    if payload.default_theme not in THEME_IDS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unknown theme preset")
    profile = get_current_profile(db, user)
    profile.default_theme = payload.default_theme
    profile.theme_settings = sanitize_theme_settings(payload.theme_settings)
    db.commit()
    db.refresh(profile)
    return profile_response(profile)


@studio_router.get("/categories", response_model=list[CategoryResponse])
def list_studio_categories(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[CategoryResponse]:
    profile = get_current_profile(db, user)
    return [category_response(category) for category in db.scalars(select(Category).where(Category.profile_id == profile.id).order_by(Category.sort_order, Category.name)).all()]


@studio_router.post("/categories", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(payload: CategoryRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> CategoryResponse:
    profile = get_current_profile(db, user)
    if db.scalar(select(Category.id).where(Category.profile_id == profile.id, Category.slug == payload.slug)):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Category slug already exists")
    category = Category(profile_id=profile.id, **payload.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category_response(category)


@studio_router.get("/collections", response_model=list[CollectionResponse])
def list_studio_collections(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[CollectionResponse]:
    profile = get_current_profile(db, user)
    collections = db.scalars(select(Collection).where(Collection.profile_id == profile.id).order_by(Collection.created_at.desc())).all()
    return [collection_response(collection) for collection in collections]


@studio_router.post("/collections", response_model=CollectionResponse, status_code=status.HTTP_201_CREATED)
def create_collection(payload: CollectionRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> CollectionResponse:
    profile = get_current_profile(db, user)
    if payload.theme_override and payload.theme_override not in THEME_IDS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unknown theme preset")
    if db.scalar(select(Collection.id).where(Collection.profile_id == profile.id, Collection.slug == payload.slug)):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Collection slug already exists")
    data = payload.model_dump()
    data["theme_settings"] = sanitize_theme_settings(data["theme_settings"])
    collection = Collection(profile_id=profile.id, **data)
    db.add(collection)
    db.commit()
    db.refresh(collection)
    return collection_response(collection)
