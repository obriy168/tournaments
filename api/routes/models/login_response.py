
from pydantic import BaseModel
from routes.models.user_role_model import UserRoleModel


class LoginResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    roles: list[UserRoleModel] = []