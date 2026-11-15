from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Request, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.rate_limit import limiter
from app.core.turnstile import verify_turnstile
from app.database import get_database
from app.schemas.review import ReviewOut, ReviewSubmit

router = APIRouter(prefix="/reviews", tags=["reviews (public)"])


@router.get("", response_model=list[ReviewOut])
async def list_reviews(db: AsyncIOMotorDatabase = Depends(get_database)):
    """Visible reviews, ordered for the 'Client feedback' section."""
    cursor = db.reviews.find({"is_visible": True}).sort("display_order", 1)
    return await cursor.to_list(length=None)


@router.post("/submit", status_code=status.HTTP_202_ACCEPTED)
@limiter.limit("5/hour")
async def submit_review(
    request: Request, payload: ReviewSubmit, db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Public review submission, gated by Turnstile. Stored hidden (is_visible=False);
    an admin publishes it from the dashboard."""
    await verify_turnstile(payload.turnstile_token, request)
    await db.reviews.insert_one(
        {
            "who": payload.who.strip(),
            "role": payload.role.strip(),
            "quote": payload.quote.strip(),
            "display_order": 0,
            "is_visible": False,
            "created_at": datetime.now(timezone.utc),
        }
    )
    return {"detail": "Submitted for moderation"}
