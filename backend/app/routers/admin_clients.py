from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.deps import get_current_admin
from app.core.object_id import parse_object_id
from app.database import get_database
from app.schemas.client import ClientCreate, ClientOut, ClientUpdate

router = APIRouter(
    prefix="/admin/clients",
    tags=["clients (admin)"],
    dependencies=[Depends(get_current_admin)],
)


@router.post("", response_model=ClientOut, status_code=status.HTTP_201_CREATED)
async def create_client(payload: ClientCreate, db: AsyncIOMotorDatabase = Depends(get_database)):
    existing = await db.clients.find_one({"slug": payload.slug})
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Slug already in use")

    result = await db.clients.insert_one(payload.model_dump())
    created = await db.clients.find_one({"_id": result.inserted_id})
    return created


@router.patch("/{client_id}", response_model=ClientOut)
async def update_client(
    client_id: str, payload: ClientUpdate, db: AsyncIOMotorDatabase = Depends(get_database)
):
    oid = parse_object_id(client_id, label="client id")
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if updates:
        await db.clients.update_one({"_id": oid}, {"$set": updates})

    updated = await db.clients.find_one({"_id": oid})
    if updated is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found")
    return updated


@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_client(client_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    oid = parse_object_id(client_id, label="client id")
    # Also remove this client's work images so nothing is orphaned.
    await db.work_images.delete_many({"client_id": client_id})
    result = await db.clients.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found")
