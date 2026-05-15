from pydantic import BaseModel, ConfigDict
from typing import Optional

class UserTeamModel(BaseModel):
    id: Optional[int] = None
    user_id: int
    team_id: int
    is_lead: bool

class UserTeamRegistrationModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: Optional[int] = None
    user_id: int
    team_id: Optional[int] = 0
    is_lead: bool