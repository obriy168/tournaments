from pydantic import BaseModel
from typing import Optional

class EvaluationModel(BaseModel):
    id: Optional[int] = None
    assignment_id: int
    scores: int
    comment: Optional[str] = None