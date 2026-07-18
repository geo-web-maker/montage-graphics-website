from pydantic import BaseModel, Field

from app.schemas.common import PyObjectId


class WorkImageCreate(BaseModel):
    image_url: str
    caption: str = ""
    display_order: int = 0
    width: int
    height: int


class WorkImageOut(BaseModel):
    id: PyObjectId = Field(alias="_id")
    client_id: str
    image_url: str
    caption: str
    display_order: int
    shape: str

    class Config:
        populate_by_name = True
