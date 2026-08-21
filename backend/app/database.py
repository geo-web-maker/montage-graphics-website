from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.config import get_settings

_client: AsyncIOMotorClient | None = None
_db: AsyncIOMotorDatabase | None = None


def connect_to_mongo() -> None:
    """Called once on app startup."""
    global _client, _db
    settings = get_settings()
    _client = AsyncIOMotorClient(settings.mongodb_uri)
    _db = _client[settings.mongodb_db_name]


def close_mongo_connection() -> None:
    """Called once on app shutdown."""
    global _client
    if _client is not None:
        _client.close()


def get_database() -> AsyncIOMotorDatabase:
    """FastAPI dependency — yields the shared database handle."""
    if _db is None:
        raise RuntimeError("Database not initialized. Did startup run?")
    return _db


async def ensure_indexes() -> None:
    """Creates indexes used by lookups/ordering. Safe to call every startup —
    Mongo no-ops if the index already exists with the same spec."""
    db = get_database()
    await db.clients.create_index("slug", unique=True)
    await db.clients.create_index("trusted_by_order")
    await db.work_images.create_index("client_id")
    await db.work_images.create_index([("client_id", 1), ("display_order", 1)])
    await db.reviews.create_index("display_order")
    await db.invoices.create_index("public_id", unique=True)
    await db.invoices.create_index("invoice_number", unique=True)
    await db.invoices.create_index("created_at")
    await db.admin_users.create_index("email", unique=True)
