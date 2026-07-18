from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_database
from app.schemas.work_image import WorkImageOut

router = APIRouter(prefix="/clients", tags=["work (public)"])


@router.get("/{slug}/work", response_model=list[WorkImageOut])
async def list_work_for_client(slug: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    client = await db.clients.find_one({"slug": slug, "is_visible": True})
    if client is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found")

    cursor = db.work_images.find({"client_id": str(client["_id"])}).sort("display_order", 1)
    return await cursor.to_list(length=None)
