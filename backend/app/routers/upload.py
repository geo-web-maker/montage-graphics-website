from fastapi import APIRouter, Depends

from app.core.deps import get_current_admin
from app.schemas.auth import UploadSignatureResponse
from app.services.cloudinary_service import build_upload_signature

router = APIRouter(
    prefix="/admin",
    tags=["upload (admin)"],
    dependencies=[Depends(get_current_admin)],
)


@router.get("/upload-signature", response_model=UploadSignatureResponse)
async def get_upload_signature(for_logo: bool = False):
    """The browser uses this to upload a file directly to Cloudinary —
    the file itself never passes through our server. for_logo=true also
    asks Cloudinary to analyze the image's dominant colors, used for the
    client logo's background-tint effect."""
    return build_upload_signature(colors=for_logo)
