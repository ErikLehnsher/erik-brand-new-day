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

    @property
    def is_dev(self) -> bool:
        return self.debug or self.app_env.lower() in {"dev", "development", "local"}

    @property
    def is_prod(self) -> bool:
        return self.app_env.lower() in {"prod", "production"}


@lru_cache
def get_settings() -> Settings:
    return Settings()
