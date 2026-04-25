from pydantic import BaseModel
from typing import Optional

class JuryMemberModel(BaseModel):
    id: Optional[int] = None
    user_id: int
    tournament_id: int