from pydantic import BaseModel
from typing import Optional

class UserRoleModel(BaseModel):
    id: Optional[int] = None
    role_id: int
    user_id: int
    tournament_id: int