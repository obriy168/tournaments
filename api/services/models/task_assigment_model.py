from pydantic import BaseModel
from typing import Optional

class TaskAssigmentModel(BaseModel):
    id: Optional[int] = None
    jury_member_id: int
    submission_id: int
    is_completed: bool