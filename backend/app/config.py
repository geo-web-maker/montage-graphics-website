from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # MongoDB
    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_db_name: str = "montage_graphics"

    # Cloudinary
    cloudinary_cloud_name: str = ""
    cloudinary_api_key: str = ""
    cloudinary_api_secret: str = ""

    # Auth
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 12  # 12 hours

    # Deprecated: pre-RBAC single-admin login. Only read by
    # scripts/seed_admin.py to migrate the original admin into the first
    # admin_users row — auth.py no longer checks these.
    admin_username: str = "admin"
    admin_password_hash: str = ""

    # EgoSMS — temp-password delivery for admin onboarding/reset
    egosms_username: str = ""
    egosms_password: str = ""
    egosms_sender_id: str = "MONTAGE"
    # True by default (dev-safe): logs the SMS instead of hitting the real
    # EgoSMS API. Must be explicitly set False on Render.
    sms_debug_mode: bool = True

    # CORS - comma-separated list of allowed frontend origins
    cors_origins: str = "http://localhost:5173"

    class Config:
        env_file = ".env"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
