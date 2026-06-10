from pydantic import BaseModel
from typing import Generic, TypeVar

T = TypeVar("T")

class PaginationMeta(BaseModel):
    page: int
    page_size: int
    total: int
    pages: int

class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    meta: PaginationMeta