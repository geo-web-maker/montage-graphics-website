from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo.errors import DuplicateKeyError

from app.core.deps import require_role, require_superadmin
from app.core.security import hash_password
from app.core.sms import generate_temp_password, send_temp_password_sms
from app.database import get_database
from app.schemas.admin_user import (
    AdminUserCreate,
    AdminUserCreateResult,
    AdminUserOut,
    PasswordResetResult,
)

# Base gate: any of the three roles that can see the section at all
# (invoice_admin never reaches this router — Dashboard/roles.js never
# shows it the tab, and role_has_section would reject it too if it tried).
router = APIRouter(
    prefix="/admin/admins",
    tags=["admins (admin)"],
    dependencies=[Depends(require_role("superadmin", "admin"))],
)


@router.get("", response_model=list[AdminUserOut], response_model_by_alias=False)
async def list_admins(db: AsyncIOMotorDatabase = Depends(get_database)):
    """Viewable by superadmin and admin alike — 'admin can see who exists
    and their role, just can't manage them' is enforced by only this route
    being open to both; create/delete/reset below require superadmin."""
    return await db.admin_users.find().to_list(length=None)


@router.post(
    "",
    response_model=AdminUserCreateResult,
    response_model_by_alias=False,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_superadmin)],
)
async def create_admin(body: AdminUserCreate, db: AsyncIOMotorDatabase = Depends(get_database)):
    temp_password = generate_temp_password()
    doc = {
        "name": body.name,
        "email": body.email,
        "phone": body.phone,
        "role": body.role,
        "password_hash": hash_password(temp_password),
        "must_change_password": True,
    }
    try:
        result = await db.admin_users.insert_one(doc)
    except DuplicateKeyError:
        raise HTTPException(status.HTTP_409_CONFLICT, "An admin with that email already exists")

    sms_sent = await send_temp_password_sms(body.name, body.phone, temp_password)
    created = await db.admin_users.find_one({"_id": result.inserted_id})
    return {**created, "sms_sent": sms_sent}


@router.patch(
    "/{admin_id}/password",
    response_model=PasswordResetResult,
    dependencies=[Depends(require_superadmin)],
)
async def reset_admin_password(admin_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    """Generates a fresh temp password, texts it to the admin's phone on
    file, and flags the account so the next login forces a password
    change — same flow as new-account creation."""
    if not ObjectId.is_valid(admin_id):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid admin id")

    admin = await db.admin_users.find_one({"_id": ObjectId(admin_id)})
    if admin is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Admin not found")

    temp_password = generate_temp_password()
    await db.admin_users.update_one(
        {"_id": admin["_id"]},
        {"$set": {"password_hash": hash_password(temp_password), "must_change_password": True}},
    )
    sms_sent = await send_temp_password_sms(admin["name"], admin["phone"], temp_password)
    return {"sms_sent": sms_sent}


@router.delete("/{admin_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_superadmin)])
async def delete_admin(
    admin_id: str,
    current: dict = Depends(require_superadmin),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    if not ObjectId.is_valid(admin_id):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid admin id")
    if admin_id == str(current["_id"]):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "You can't delete your own account")
    await db.admin_users.delete_one({"_id": ObjectId(admin_id)})
