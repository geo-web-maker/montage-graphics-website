from pydantic import BaseModel, Field

from app.schemas.common import PyObjectId


class ReviewCreate(BaseModel):
    quote: str
    who: str
    role: str = ""
    display_order: int = 0
    is_visible: bool = True


class ReviewUpdate(BaseModel):
    quote: str | None = None
    who: str | None = None
    role: str | None = None
    display_order: int | None = None
    is_visible: bool | None = None


class ReviewOut(BaseModel):
    id: PyObjectId = Field(validation_alias="_id")
    quote: str
    who: str
    role: str
    display_order: int
    is_visible: bool

    class Config:
        populate_by_name = True
