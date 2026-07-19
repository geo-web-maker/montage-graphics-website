from bson import ObjectId
from bson.errors import InvalidId
from fastapi import HTTPException, status


def parse_object_id(value: str, *, label: str = "id") -> ObjectId:
    """Parse a path-param string into a Mongo ObjectId, or raise a clean 400.

    Without this, a bad id (e.g. "undefined" from a frontend bug) hits
    ObjectId() directly, raises InvalidId, and becomes an *unhandled*
    exception. Unhandled exceptions are caught by Starlette's outer
    ServerErrorMiddleware, which sits outside CORSMiddleware — so the
    response never gets an Access-Control-Allow-Origin header and the
    browser reports a CORS failure instead of the real 400/500.
    Raising HTTPException here keeps it inside ExceptionMiddleware,
    which is wrapped by CORSMiddleware, so the error response is CORS-safe.
    """
    try:
        return ObjectId(value)
    except InvalidId:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid {label}"
        )
