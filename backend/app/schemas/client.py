from pydantic import BaseModel, Field

from app.schemas.common import PyObjectId


class ClientCreate(BaseModel):
    name: str
    slug: str
    logo_url: str
    logo_dominant_color: str = "#1B1D22"
    trusted_by_order: int = 0
    is_visible: bool = True


class ClientUpdate(BaseModel):
    name: str | None = None
    logo_url: str | None = None
    logo_dominant_color: str | None = None
    trusted_by_order: int | None = None
    is_visible: bool | None = None


class ClientOut(BaseModel):
    # validation_alias (not alias) so Mongo's "_id" is accepted on the way in,
    # but the JSON sent to the frontend uses "id" — which is what every
    # frontend consumer (ClientList, WorkCarousel, TrustedByReel) reads.
    id: PyObjectId = Field(validation_alias="_id")
    name: str
    slug: str
    logo_url: str
    logo_dominant_color: str
    trusted_by_order: int
    is_visible: bool

    class Config:
        populate_by_name = True
