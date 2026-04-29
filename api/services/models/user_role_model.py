from pydantic import BaseModel
from typing import Optional
from enum import Enum

class RoleEnum(str, Enum):
    ADMIN = "Admin"
    JURY = "Jury"
    PARTICIPANT = "Participant"

class UserRoleModel(BaseModel):
    id: Optional[int] = None
    user_id: int
    tournament_id: int
    role: RoleEnum