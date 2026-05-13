from fastapi import HTTPException
from routes.models.user_session import UserSession
from enums.role_enum import RoleEnum


def is_tournament_organizer(user: UserSession, tournament_id: int) -> bool:
    return any(
        role.tournament_id == tournament_id
        and role.role == RoleEnum.ORGANIZER
        for role in user.roles
    )

def is_tournament_staff(user: UserSession, tournament_id: int) -> bool:
    return any(
        role.tournament_id == tournament_id
        and role.role in [RoleEnum.ORGANIZER, RoleEnum.JURY]
        for role in user.roles
    )

def forbidden(detail: str = "Forbidden"):
    raise HTTPException(status_code=403, detail=detail)

def not_found(detail: str = "Not found"):
    raise HTTPException(status_code=404, detail=detail)