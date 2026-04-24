from pydantic import BaseModel
from typing import Optional

class RequirementGroupModel(BaseModel):
    id: Optional[int] = None
    name: str
    task_id: int