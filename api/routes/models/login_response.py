
from pydantic import BaseModel


class LoginResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str