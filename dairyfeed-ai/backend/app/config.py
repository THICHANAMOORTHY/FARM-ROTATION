"""Settings read from environment variables or backend/.env."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Supabase. If either is empty, the backend uses an in-memory store (data is lost on restart).
    supabase_url: str = ""
    supabase_service_key: str = ""

    # Shared secret the ESP32 devices send in the X-Device-Key header.
    device_api_key: str = ""

    # Token for the expert labelling page (used from Phase 2).
    admin_token: str = ""

    # Comma-separated browser origins allowed to call the API.
    cors_origins: str = "http://localhost:5173"

    @property
    def supabase_enabled(self) -> bool:
        return bool(self.supabase_url and self.supabase_service_key)

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
