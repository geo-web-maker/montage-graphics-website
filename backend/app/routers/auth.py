from fastapi import APIRouter, Depends, HTTPException, Request, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.deps import get_current_admin
from app.core.rate_limit import limiter
from app.core.security import create_access_token, hash_password, verify_password
from app.database import get_database
from app.schemas.admin_user import ChangePasswordRequest
from app.schemas.auth import LoginRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
async def login(request: Request, payload: LoginRequest, db: AsyncIOMotorDatabase = Depends(get_database)):
    user = await db.admin_users.find_one({"email": payload.email})
    valid_password = user is not None and verify_password(payload.password, user["password_hash"])

    if not valid_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    token = create_access_token(subject=str(user["_id"]))
    return TokenResponse(
        access_token=token,
        role=user["role"],
        must_change_password=user.get("must_change_password", False),
    )


@router.post("/change-password", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("5/minute")
async def change_password(
    request: Request,
    payload: ChangePasswordRequest,
    user: dict = Depends(get_current_admin),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """The only action a must_change_password account can take — this route
    intentionally depends on get_current_admin directly, not
    require_password_current, or a forced-reset account could never
    escape the 403 loop to actually change its password."""
    if not verify_password(payload.old_password, user["password_hash"]):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Current password is incorrect")

    await db.admin_users.update_one(
        {"_id": user["_id"]},
        {"$set": {"password_hash": hash_password(payload.new_password), "must_change_password": False}},
    )
