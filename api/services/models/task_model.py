from pydantic import BaseModel, model_validator
from typing import Optional
from datetime import datetime
from enum import Enum

class TaskStatus(str, Enum):
    DRAFT = "Draft"
    ACTIVE = "Active"
    SUBMISSION_CLOSED = "SubmissionClosed"
    EVALUATED = "Evaluated"

class TaskModel(BaseModel):
    id: Optional[int] = None
    tournament_id: int
    name: str
    description: str
    specifications: str
    start_date: datetime
    end_date: datetime
    status: TaskStatus

    @model_validator(mode='after')
    def validate(self) -> 'TaskModel':
        if self.end_date < self.start_date:
            raise ValueError("registration_end_date must be after registration_start_date")
        return self

