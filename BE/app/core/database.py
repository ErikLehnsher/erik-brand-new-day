from datetime import datetime, timezone

from sqlalchemy import inspect, select, text
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import get_settings

settings = get_settings()

engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def init_db() -> None:
    from app.models.post import Post
    from app.models.profile import Category, Collection, Profile
    from app.models.reset_token import PasswordResetToken
    from app.models.review import Review
    from app.models.user import User

    Base.metadata.create_all(bind=engine)
    _ = User, PasswordResetToken, Profile, Category, Collection, Post, Review
    # Keep the existing production table compatible when publication metadata
    # is introduced after the first deployment.
    existing_columns = {column["name"] for column in inspect(engine).get_columns("posts")}
    migrations = {
        "category": "VARCHAR(40) NOT NULL DEFAULT 'daily'",
        "cover_image_url": "TEXT",
        "video_url": "TEXT",
        "author_id": "VARCHAR(36)",
        "profile_id": "VARCHAR(36)",
        "category_id": "VARCHAR(36)",
    }
    with engine.begin() as connection:
        for column, definition in migrations.items():
            if column not in existing_columns:
                connection.execute(text(f"ALTER TABLE posts ADD COLUMN {column} {definition}"))

    with SessionLocal() as db:
        if db.scalar(select(Post.id)):
            return
        db.add_all(
            [
                Post(
                    slug="midnight-notes-from-the-red-room",
                    title="Midnight notes from the red room",
                    excerpt="A daily log entry about building the brand, keeping the blog alive, and turning small observations into a visual system.",
                    content="This first post is a seeded entry so the homepage can show real blog content before the editor exists. It will later become the backbone for daily logs, essays, and long-form writing.",
                    status="published",
                    published_at=datetime.now(timezone.utc),
                ),
                Post(
                    slug="what-i-want-this-site-to-feel-like",
                    title="What I want this site to feel like",
                    excerpt="A long-form piece about design direction, personal memory, and the specific mood of a private public diary.",
                    content="This seeded article explains the product mood: vintage, personal, editorial, and capable of growing into a public brand without losing intimacy.",
                    status="published",
                    published_at=datetime.now(timezone.utc),
                ),
                Post(
                    slug="tools-i-actually-use-every-day",
                    title="Tools I actually use every day",
                    excerpt="A practical post that can later connect reminders, calendar events, media uploads, and other small utilities.",
                    content="This post can later be connected to personal tools, bookmarks, and reminders. For now it proves the content model is working.",
                    status="published",
                    published_at=datetime.now(timezone.utc),
                ),
            ]
        )
        db.commit()
