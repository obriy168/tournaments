from pydantic import BaseModel
from typing import Optional

class UserModel(BaseModel):
    id: Optional[int] = None
    first_name: str
    last_name: str
    email: str
    password: str
    

    