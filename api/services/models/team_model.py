from pydantic import BaseModel
from typing import Optional

class TeamModel(BaseModel):
    id: Optional[int] = None
    tournament_id: int
    name: str
    city: str
    organization: str
