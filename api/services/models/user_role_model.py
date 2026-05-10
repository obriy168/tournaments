from pydantic import BaseModel
from typing import Optional
from enums.role_enum import RoleEnum

class UserRoleModel(BaseModel):
    id: Optional[int] = None
    user_id: int
    tournament_id: Optional[int] = None
    role: RoleEnum