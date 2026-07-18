from pydantic import BaseModel, Field

from app.schemas.common import PyObjectId


class ClientCreate(BaseModel):
    name: str
    slug: str
    logo_url: str
    trusted_by_order: int = 0
    is_visible: bool = True


class ClientUpdate(BaseModel):
    name: str | None = None
    logo_url: str | None = None
    trusted_by_order: int | None = None
    is_visible: bool | None = None


class ClientOut(BaseModel):
    id: PyObjectId = Field(alias="_id")
    name: str
    slug: str
    logo_url: str
    trusted_by_order: int
    is_visible: bool

    class Config:
        populate_by_name = True
