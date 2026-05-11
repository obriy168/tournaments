from pydantic import BaseModel
from routes.models.user_role_model import UserRoleModel

class UserSession(BaseModel):
    user_id: int
    email: str
    #first_name: str
    #last_name: str
    roles: list[UserRoleModel]