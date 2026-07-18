from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_database
from app.schemas.client import ClientOut

router = APIRouter(prefix="/clients", tags=["clients (public)"])


@router.get("", response_model=list[ClientOut])
async def list_clients(db: AsyncIOMotorDatabase = Depends(get_database)):
    """Visible clients, ordered for the 'Trusted by' reel / work carousel."""
    cursor = db.clients.find({"is_visible": True}).sort("trusted_by_order", 1)
    return await cursor.to_list(length=None)
