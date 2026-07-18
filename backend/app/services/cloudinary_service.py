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


def build_upload_signature(folder: str = "montage-graphics", colors: bool = False) -> dict:
    """Signs an upload request so the browser can POST the file directly to
    Cloudinary. The API secret never leaves the server.

    colors=True asks Cloudinary to analyze the image's predominant colors
    as part of the upload — used for the client logo upload so we can
    derive a background tint from it. Every param sent to Cloudinary that
    affects the request must also be part of what's signed, so `colors`
    has to be included here, not just tacked onto the form data later.
    """
    _ensure_configured()
    settings = get_settings()
    timestamp = int(time.time())

    params_to_sign = {"timestamp": timestamp, "folder": folder}
    if colors:
        params_to_sign["colors"] = "true"
    signature = cloudinary.utils.api_sign_request(params_to_sign, settings.cloudinary_api_secret)

    result = {
        "timestamp": timestamp,
        "signature": signature,
        "api_key": settings.cloudinary_api_key,
        "cloud_name": settings.cloudinary_cloud_name,
        "folder": folder,
    }
    if colors:
        result["colors"] = "true"
    return result
