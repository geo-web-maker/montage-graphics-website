from fastapi import APIRouter, HTTPException, Request, status

from app.config import get_settings
from app.core.rate_limit import limiter
from app.core.security import create_access_token, verify_password
from app.schemas.auth import LoginRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
async def login(request: Request, payload: LoginRequest):
    settings = get_settings()

    valid_username = payload.username == settings.admin_username
    valid_password = bool(settings.admin_password_hash) and verify_password(
        payload.password, settings.admin_password_hash
    )

    if not (valid_username and valid_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )

    token = create_access_token(subject=payload.username)
    return TokenResponse(access_token=token)
