from pydantic import BaseModel


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UploadSignatureResponse(BaseModel):
    """Everything the browser needs to upload a file straight to Cloudinary,
    without the file ever passing through our server."""

    timestamp: int
    signature: str
    api_key: str
    cloud_name: str
    folder: str
    colors: str | None = None
