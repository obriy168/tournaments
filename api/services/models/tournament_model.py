from pydantic import BaseModel, Field, model_validator
from typing import Optional
from datetime import datetime
from enum import Enum

class TournamentStatus(str, Enum):
    DRAFT = "Draft"
    REGISTRATION = "Registration"
    RUNNING = "Running"
    FINISHED = "Finished"

class TournamentModel(BaseModel):
    id: Optional[int] = None
    name: str
    description: str
    start_date: datetime
    registration_start_date: datetime
    registration_end_date: datetime
    max_teams: int = Field(ge=1)
    min_user_count: int = Field(ge=1)
    max_user_count: int = Field(ge=1)
    status: TournamentStatus = TournamentStatus.DRAFT

    @model_validator(mode='after')
    def validate(self) -> 'TournamentModel':
        if self.registration_end_date < self.registration_start_date:
            raise ValueError("registration_end_date must be after registration_start_date")
        if self.start_date < self.registration_end_date:
            raise ValueError("start_date must be after registration_end_date")
        if self.max_user_count < self.min_user_count:
            raise ValueError("max_user_count must be >= min_user_count")
        return self