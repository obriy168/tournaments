from pydantic import BaseModel, ConfigDict
from typing import Optional
from services.models.user_team_model import UserTeamRegistrationModel

class TeamModel(BaseModel):
    id: Optional[int] = None
    tournament_id: int
    name: str
    city: str
    organization: str

class TeamRegistrationModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: Optional[int] = None
    tournament_id: int
    name: str
    city: str
    organization: str
    user_teams: list[UserTeamRegistrationModel]