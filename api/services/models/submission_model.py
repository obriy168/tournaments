from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SubmissionModel(BaseModel):
    id: Optional[int] = None
    team_id: int
    task_id: int
    created_on: datetime
    github_url: str
    video_url: str
    live_demo_url: Optional[str] = None
    description: Optional[str] = None