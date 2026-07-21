from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.deps import get_current_admin
from app.core.object_id import parse_object_id
from app.database import get_database
from app.schemas.review import ReviewCreate, ReviewOut, ReviewUpdate

router = APIRouter(
    prefix="/admin/reviews",
    tags=["reviews (admin)"],
    dependencies=[Depends(get_current_admin)],
)


@router.get("", response_model=list[ReviewOut])
async def list_all_reviews(db: AsyncIOMotorDatabase = Depends(get_database)):
    """Every review regardless of is_visible — for the admin dashboard list."""
    cursor = db.reviews.find({}).sort("display_order", 1)
    return await cursor.to_list(length=None)


@router.post("", response_model=ReviewOut, status_code=status.HTTP_201_CREATED)
async def create_review(payload: ReviewCreate, db: AsyncIOMotorDatabase = Depends(get_database)):
    result = await db.reviews.insert_one(payload.model_dump())
    created = await db.reviews.find_one({"_id": result.inserted_id})
    return created


@router.patch("/{review_id}", response_model=ReviewOut)
async def update_review(
    review_id: str, payload: ReviewUpdate, db: AsyncIOMotorDatabase = Depends(get_database)
):
    oid = parse_object_id(review_id, label="review id")
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if updates:
        await db.reviews.update_one({"_id": oid}, {"$set": updates})

    updated = await db.reviews.find_one({"_id": oid})
    if updated is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    return updated


@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review(review_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    oid = parse_object_id(review_id, label="review id")
    result = await db.reviews.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
