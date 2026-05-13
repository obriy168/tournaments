from fastapi import Depends, HTTPException

from routes.models.user_session import UserSession
from util.auth import validate_session
from enums.role_enum import RoleEnum

def is_tournament_organizer(user: UserSession, tournament_id: int) -> bool:
    return any(
        role.tournament_id == tournament_id
        and role.role == RoleEnum.ORGANIZER
        for role in user.roles
    )

class RoleRequired:
    def __init__(self, target_roles: list[RoleEnum]):
        self.target_roles = target_roles

    def __call__(self, user: UserSession = Depends(validate_session)):
        user_roles = [role.role for role in user.roles]
        if not any(role in self.target_roles for role in user_roles):
             raise HTTPException(status_code=403, detail="Forbidden: you are not allowed to access this resource.")

        return user
