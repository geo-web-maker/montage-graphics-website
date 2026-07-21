from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_database
from app.schemas.review import ReviewOut

router = APIRouter(prefix="/reviews", tags=["reviews (public)"])


@router.get("", response_model=list[ReviewOut])
async def list_reviews(db: AsyncIOMotorDatabase = Depends(get_database)):
    """Visible reviews, ordered for the 'Client feedback' section."""
    cursor = db.reviews.find({"is_visible": True}).sort("display_order", 1)
    return await cursor.to_list(length=None)
