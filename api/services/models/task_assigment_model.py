from pydantic import BaseModel
from typing import Optional

class TaskAssigmentModel(BaseModel):
    id: Optional[int] = None
    evaluator_id: int
    submission_id: int
    is_completed: bool