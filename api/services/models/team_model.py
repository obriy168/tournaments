from pydantic import BaseModel
from typing import Optional
from services.models.user_team_model import UserTeamModel

class TeamModel(BaseModel):
    id: Optional[int] = None
    tournament_id: int
    name: str
    city: str
    organization: str

class TeamRegistrationModel(BaseModel):
    id: Optional[int] = None
    tournament_id: int
    name: str
    city: str
    organization: str
    users_team: list[UserTeamModel]