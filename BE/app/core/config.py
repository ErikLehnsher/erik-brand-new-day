from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=(".env.local", ".env"), env_file_encoding="utf-8", extra="ignore")

    app_env: str = "development"
    debug: bool = True
    database_url: str = "postgresql+psycopg://eriklehnsher:change-me@localhost:5432/erik_brand_new_day"
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    secret_key: str = "change-me-in-production"
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001"
    friday_bridge_url: str = ""
    friday_bridge_token: str = ""
    friday_bridge_timeout_seconds: int = 300
    friday_admin_emails: str = ""

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def friday_admin_email_list(self) -> set[str]:
        return {email.strip().lower() for email in self.friday_admin_emails.split(",") if email.strip()}

    @property
    def is_dev(self) -> bool:
        return self.debug or self.app_env.lower() in {"dev", "development", "local"}

    @property
    def is_prod(self) -> bool:
        return self.app_env.lower() in {"prod", "production"}


@lru_cache
def get_settings() -> Settings:
    return Settings()
