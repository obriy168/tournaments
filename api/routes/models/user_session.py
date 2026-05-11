from pydantic import BaseModel
from enums.role_enum import RoleEnum

class UserSession(BaseModel):
    user_id: int
    email: str
    #first_name: str
    #last_name: str
    roles: list[UserSessionRole]
    
    @property
    def is_admin(self) -> bool:
        return any(r.role == RoleEnum.ADMIN for r in self.roles)

class UserSessionRole(BaseModel):
    user_id: int
    tournament_id: int | None
    role: str