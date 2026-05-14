from fastapi import APIRouter, Depends, HTTPException
from services.models.user_role_model import UserRoleModel
from services.user_role_service import UserRoleService
from services.tournaments_service import TournamentsService
from typing import Annotated
from util.access.tournament_access import TournamentAccess
from util.auth import validate_session
from routes.models.user_session import UserSession

user_role_router = APIRouter(prefix="/user_role", tags=["user_role"])

@user_role_router.get("/{user_id}/{tournament_id}")
async def get_user_role(user_id: int, tournament_id: int, 
                        user_role_service: Annotated[UserRoleService, Depends(UserRoleService)],
                        user_session: Annotated[UserSession, Depends(validate_session)]):
    role = await user_role_service.get_role_by_user_id(user_id, tournament_id)
    if role is None:
        raise HTTPException(status_code=404, detail="User or user role in this tournament not found")
    return role

@user_role_router.post("/")
async def set_user_role(user_role: UserRoleModel, user_role_service: Annotated[UserRoleService, Depends(UserRoleService)],
                        user_session: Annotated[UserSession, Depends(validate_session)]):
    await TournamentAccess.as_organizer(tournament_id=user_role.tournament_id, user=user_session)
    return await user_role_service.set_user_role(user_role)

@user_role_router.get("/role/{role_name}/{tournament_id}")
async def get_users_by_role_name(role_name: str, tournament_id: int, 
                                 user_role_service: Annotated[UserRoleService, Depends(UserRoleService)],
                                 user_session: Annotated[UserSession, Depends(validate_session)]):
    return await user_role_service.get_users_by_role_name(role_name, tournament_id)