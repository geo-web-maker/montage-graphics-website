from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.deps import get_current_admin
from app.database import get_database
from app.schemas.work_image import WorkImageCreate, WorkImageOut
from app.services.layout import classify_shape

router = APIRouter(
    prefix="/admin",
    tags=["work (admin)"],
    dependencies=[Depends(get_current_admin)],
)


@router.post(
    "/clients/{client_id}/work", response_model=WorkImageOut, status_code=status.HTTP_201_CREATED
)
async def add_work_image(
    client_id: str, payload: WorkImageCreate, db: AsyncIOMotorDatabase = Depends(get_database)
):
    client = await db.clients.find_one({"_id": ObjectId(client_id)})
    if client is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found")

    shape = classify_shape(payload.width, payload.height)
    doc = payload.model_dump() | {"client_id": client_id, "shape": shape}
    result = await db.work_images.insert_one(doc)
    created = await db.work_images.find_one({"_id": result.inserted_id})
    return created


@router.delete("/work/{work_image_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_work_image(work_image_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    result = await db.work_images.delete_one({"_id": ObjectId(work_image_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Work image not found")
