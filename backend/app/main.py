import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.config import get_settings
from app.core.rate_limit import limiter
from app.database import close_mongo_connection, connect_to_mongo, ensure_indexes
from app.routers import (
    admin_clients,
    admin_invoices,
    admin_reviews,
    admin_work,
    auth,
    clients,
    public_invoices,
    reviews,
    upload,
    work,
)

logger = logging.getLogger("montage")

@asynccontextmanager
async def lifespan(app: FastAPI):
    connect_to_mongo()
    await ensure_indexes()
    yield
    close_mongo_connection()


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title="Montage Graphics API", lifespan=lifespan)

    if settings.jwt_secret == "change-me-in-production":
        logger.warning(
            "JWT_SECRET is still set to the default placeholder value. "
            "Every admin token can be forged. Set a strong, random JWT_SECRET "
            "in the deployment's environment variables."
        )

    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    app.add_middleware(SlowAPIMiddleware)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Public
    app.include_router(clients.router)
    app.include_router(work.router)
    app.include_router(auth.router)
    app.include_router(reviews.router)
    app.include_router(public_invoices.router)

    # Admin (protected)
    app.include_router(admin_clients.router)
    app.include_router(admin_work.router)
    app.include_router(upload.router)
    app.include_router(admin_reviews.router)
    app.include_router(admin_invoices.router)

    @app.get("/health", tags=["health"])
    async def health():
        return {"status": "ok"}

    return app


app = create_app()
