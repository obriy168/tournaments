from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class RequirementModel(BaseModel):
    id: int
    description: str
    max_score: int

    model_config = ConfigDict(from_attributes=True)

class RequirementsGroupModel(BaseModel):
    id: int 
    name: str
    requirements: list[RequirementModel]

    model_config = ConfigDict(from_attributes=True)

class EvaluationModel(BaseModel):
    id: int
    scores: int
    comment: Optional[str]

    model_config = ConfigDict(from_attributes=True)

class TaskAssignmentModel(BaseModel):
    id: int
    evaluations: list[EvaluationModel]

    model_config = ConfigDict(from_attributes=True)

class SubmissionModel(BaseModel):
    id: int
    created_on: datetime
    github_url: str
    video_url: str
    live_demo_url: Optional[str]
    description: Optional[str]

    assignments: list[TaskAssignmentModel]

    model_config = ConfigDict(from_attributes=True)

class TasksDetailedResponse(BaseModel):
    id: int
    name: str
    description: str
    specifications: str
    start_date: datetime
    end_date: datetime
    status: str

    requirement_groups: list[RequirementsGroupModel]
    submissions: list[SubmissionModel]

    model_config = ConfigDict(from_attributes=True)



