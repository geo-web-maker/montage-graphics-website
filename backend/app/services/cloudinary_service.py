import time

import cloudinary
import cloudinary.utils

from app.config import get_settings

_configured = False


def _ensure_configured() -> None:
    global _configured
    if _configured:
        return
    settings = get_settings()
    cloudinary.config(
        cloud_name=settings.cloudinary_cloud_name,
        api_key=settings.cloudinary_api_key,
        api_secret=settings.cloudinary_api_secret,
        secure=True,
    )
    _configured = True


def build_upload_signature(folder: str = "montage-graphics") -> dict:
    """Signs an upload request so the browser can POST the file directly to
    Cloudinary. The API secret never leaves the server."""
    _ensure_configured()
    settings = get_settings()
    timestamp = int(time.time())

    params_to_sign = {"timestamp": timestamp, "folder": folder}
    signature = cloudinary.utils.api_sign_request(params_to_sign, settings.cloudinary_api_secret)

    return {
        "timestamp": timestamp,
        "signature": signature,
        "api_key": settings.cloudinary_api_key,
        "cloud_name": settings.cloudinary_cloud_name,
        "folder": folder,
    }
