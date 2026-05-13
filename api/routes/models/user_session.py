from pydantic import BaseModel
from routes.models.user_role_model import UserRoleModel
from enums.role_enum import RoleEnum


class UserSession(BaseModel):
    user_id: int
    email: str

    roles: list[UserRoleModel]
    
    @property
    def is_admin(self) -> bool:
        return any(r.role == RoleEnum.ADMIN for r in self.roles)
