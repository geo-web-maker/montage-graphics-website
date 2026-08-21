from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.schemas.common import PyObjectId

MIN_PASSWORD_LENGTH = 8
VALID_ROLES = {"superadmin", "admin", "invoice_admin"}


def _validate_password_length(value: str) -> str:
    if len(value) < MIN_PASSWORD_LENGTH:
        raise ValueError(f"Password must be at least {MIN_PASSWORD_LENGTH} characters")
    return value


def _validate_role(value: str) -> str:
    if value not in VALID_ROLES:
        raise ValueError(f"Unknown role '{value}'")
    return value


class AdminUserOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: PyObjectId = Field(validation_alias="_id")
    name: str
    email: str
    phone: str
    role: str
    must_change_password: bool = False


class AdminUserCreateResult(AdminUserOut):
    sms_sent: bool


class AdminUserCreate(BaseModel):
    name: str
    email: str
    phone: str  # required — this is where the temp password gets texted
    role: str

    _check_role = field_validator("role")(_validate_role)


class PasswordResetResult(BaseModel):
    sms_sent: bool


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str

    _check_password = field_validator("new_password")(_validate_password_length)
