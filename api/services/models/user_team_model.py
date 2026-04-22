from pydantic import BaseModel
from typing import Optional

class UserTeamModel(BaseModel):
    id: Optional[int] = None
    user_id: int
    team_id: int
    is_lead: bool