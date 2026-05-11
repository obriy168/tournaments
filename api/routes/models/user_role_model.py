
from pydantic import BaseModel

class UserRoleModel(BaseModel):
    tournament_id: int | None
    role: str