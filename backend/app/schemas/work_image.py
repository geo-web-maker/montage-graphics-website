from typing import Literal

from pydantic import BaseModel, Field, model_validator

from app.schemas.common import PyObjectId


class WorkImageCreate(BaseModel):
    image_url: str
    caption: str = ""
    display_order: int = 0
    width: int
    height: int
    # "image" (default, so existing clients/docs keep working) or "video" for
    # motion-graphics pieces. Videos are uploaded straight to Cloudinary like
    # images; the public site derives the poster frame from the video URL.
    media_type: Literal["image", "video"] = "image"
    duration: float | None = Field(default=None, ge=0, le=3600)

    @model_validator(mode="after")
    def _check_media_url(self):
        if self.media_type == "video":
            if not self.image_url.startswith("https://res.cloudinary.com/") or "/video/upload/" not in self.image_url:
                raise ValueError("Video work must be an HTTPS Cloudinary video upload")
        return self


class WorkImageOut(BaseModel):
    id: PyObjectId = Field(validation_alias="_id")
    client_id: str
    image_url: str
    caption: str
    display_order: int
    shape: str
    media_type: str = "image"
    duration: float | None = None
    # intrinsic size, lets the public gallery reserve space for video before it loads
    width: int | None = None
    height: int | None = None

    class Config:
        populate_by_name = True
