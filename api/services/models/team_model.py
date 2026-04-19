from pydantic import BaseModel
from typing import Optional

class TeamModel(BaseModel):
    id: int = Optional[int]
    tournament_id: int
    name: str
    city: str
    organization: str
