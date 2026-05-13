from pydantic import BaseModel

class UserTeamResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    is_lead: bool = False