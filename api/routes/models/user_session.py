from pydantic import BaseModel

class UserSession(BaseModel):
    user_id: int
    email: str
    #first_name: str
    #last_name: str
    roles: list[UserSessionRole]

class UserSessionRole(BaseModel):
    tournament_id: int | None
    role: str