
from pydantic import BaseModel

class UserRoleModel(BaseModel):
    user_id: int
    tournament_id: int | None
    role: str