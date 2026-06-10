from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class EvaluationModel(BaseModel):
    id: int
    scores: int
    comment: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class TaskAssignmentModel(BaseModel):
    id: int
    evaluator_id: int
    evaluations: list[EvaluationModel]

    model_config = ConfigDict(from_attributes=True)

class TeamShortModel(BaseModel):
    id: int
    tournament_id: int
    name: str

    model_config = ConfigDict(from_attributes=True)

class TaskShortModel(BaseModel):
    id: int
    tournament_id: int
    name: str
    
    model_config = ConfigDict(from_attributes=True)

class SubmissionDetailedResponse(BaseModel):
    id: int
    created_on: datetime
    github_url: str
    video_url: str
    live_demo_url: str
    description: str

    task: TaskShortModel
    team: TeamShortModel
    assignments: list[TaskAssignmentModel]

    model_config = ConfigDict(from_attributes=True)