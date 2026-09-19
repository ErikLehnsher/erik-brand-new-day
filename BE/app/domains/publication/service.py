import re

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.profile import Category, Profile
from app.models.user import User

DEFAULT_CATEGORIES = (
    ("Daily", "daily", "Những ghi chép thường ngày.", "#e76f51"),
    ("Odoo", "odoo", "ERP, triển khai và kỹ thuật.", "#714fba"),
    ("Technology", "technology", "Công nghệ, AI và product.", "#167c80"),
    ("Video", "video", "Video, hình ảnh và ghi chú thị giác.", "#c87024"),
)

THEME_PRESETS = (
    {"id": "newspaper", "name": "Newspaper", "description": "Báo giấy, nhiều cột và headline rõ ràng."},
    {"id": "poster-gallery", "name": "Poster Gallery", "description": "Grid hình ảnh, cover mạnh và bố cục portfolio."},
    {"id": "scrapbook", "name": "Scrapbook", "description": "Journal, note và cảm giác thủ công."},
    {"id": "cinema", "name": "Cinema", "description": "Tối, rating, video và review."},
    {"id": "minimal", "name": "Minimal Reading", "description": "Tập trung vào trải nghiệm đọc dài."},
)
THEME_IDS = {preset["id"] for preset in THEME_PRESETS}
ALLOWED_THEME_SETTINGS = {"accent_color", "background_color", "heading_font", "body_font", "card_style", "density"}


def to_handle(value: str) -> str:
    normalized = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return (normalized or "writer")[:48]


def ensure_profile(db: Session, user: User) -> Profile:
    profile = db.scalar(select(Profile).where(Profile.user_id == user.id))
    if profile:
        return profile

    base_handle = to_handle(user.email.split("@", 1)[0])
    handle = base_handle
    suffix = 2
    while db.scalar(select(Profile.id).where(Profile.handle == handle)):
        handle = f"{base_handle[:42]}-{suffix}"
        suffix += 1

    profile = Profile(user_id=user.id, handle=handle, display_name=user.email.split("@", 1)[0])
    db.add(profile)
    db.flush()
    db.add_all(
        Category(profile_id=profile.id, name=name, slug=slug, description=description, color=color, sort_order=index)
        for index, (name, slug, description, color) in enumerate(DEFAULT_CATEGORIES)
    )
    db.flush()
    return profile


def sanitize_theme_settings(settings: dict | None) -> dict:
    if not settings:
        return {}
    return {key: value for key, value in settings.items() if key in ALLOWED_THEME_SETTINGS and isinstance(value, (str, int, float, bool))}
