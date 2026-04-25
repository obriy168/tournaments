from pydantic import BaseModel
from typing import Optional

class RequirementModel(BaseModel):
    id: Optional[int] = None
    name: str
    description: str
    max_score: int
    requirement_group_id: int