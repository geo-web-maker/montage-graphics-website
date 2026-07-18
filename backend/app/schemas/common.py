from typing import Annotated

from bson import ObjectId
from pydantic import BeforeValidator

# Lets Pydantic models accept a Mongo ObjectId and serialize it as a plain
# string in API responses, instead of leaking bson types to the frontend.
PyObjectId = Annotated[str, BeforeValidator(str)]


def is_valid_object_id(value: str) -> bool:
    return ObjectId.is_valid(value)
