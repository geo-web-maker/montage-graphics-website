from bson import ObjectId
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.roles import role_has_section
from app.core.security import decode_access_token
from app.database import get_database

_bearer_scheme = HTTPBearer()


async def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer_scheme),
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> dict:
    """Protects admin routes. Raises 401 if the bearer token is missing/invalid
    or the account it points to no longer exists. Returns the admin_users
    document (dict) — routes that only need the old string-username
    behavior can read user["email"] or user["name"] off it."""
    user_id = decode_access_token(credentials.credentials)
    if user_id is None or not ObjectId.is_valid(user_id):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = await db.admin_users.find_one({"_id": ObjectId(user_id)})
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account no longer exists",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def require_password_current(user: dict = Depends(get_current_admin)) -> dict:
    """Blocks every admin action except /auth/change-password while an
    account has a pending forced password change (the temp password from
    SMS onboarding/reset shouldn't be usable for anything else).
    require_role and require_superadmin build on this rather than
    get_current_admin directly, so it applies everywhere those are used."""
    if user.get("must_change_password"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Password change required before continuing",
        )
    return user


def require_role(*roles: str):
    """Use as a route dependency: Depends(require_role("superadmin", "admin")).
    Section-level gate — for the finer "can view but not manage" split within
    the admins section, see require_superadmin used on individual routes."""

    async def checker(user: dict = Depends(require_password_current)) -> dict:
        if user["role"] not in roles:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Your role can't access this")
        return user

    return checker


def require_section(section: str):
    """Use as a route dependency: Depends(require_section("invoices"))."""

    async def checker(user: dict = Depends(require_password_current)) -> dict:
        if not role_has_section(user["role"], section):
            raise HTTPException(status.HTTP_403_FORBIDDEN, f"Your role can't access '{section}'")
        return user

    return checker


def require_superadmin(user: dict = Depends(require_password_current)) -> dict:
    if user["role"] != "superadmin":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Super admin only")
    return user
