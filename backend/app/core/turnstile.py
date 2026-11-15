import logging

import httpx
from fastapi import HTTPException, Request, status

from app.config import get_settings

VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"
logger = logging.getLogger("montage.turnstile")


async def verify_turnstile(token: str | None, request: Request) -> None:
    """Validate a Cloudflare Turnstile token server-side. Fails closed: a missing
    secret or an unreachable Cloudflare blocks the request rather than waving it
    through. Tokens are single-use, so call this once per submission."""
    settings = get_settings()
    if not settings.turnstile_secret_key:
        logger.error("TURNSTILE_SECRET_KEY is not set; refusing protected request")
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "Captcha is not configured")
    if not token or len(token) > 2048:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Captcha required")

    data = {"secret": settings.turnstile_secret_key, "response": token}
    ip = request.headers.get("cf-connecting-ip") or (request.client.host if request.client else None)
    if ip:
        data["remoteip"] = ip

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.post(VERIFY_URL, data=data)
            resp.raise_for_status()
            result = resp.json()
    except (httpx.HTTPError, ValueError):
        logger.exception("Turnstile siteverify call failed")
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "Captcha verification unavailable")

    if not result.get("success"):
        logger.info("Turnstile rejected token: %s", result.get("error-codes"))
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Captcha verification failed")
