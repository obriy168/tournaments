from pydantic import BaseModel, Field

class PaginationModel(BaseModel):
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=15, ge=1, le=100)

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.limit