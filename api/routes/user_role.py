from fastapi import APIRouter, Depends, HTTPException
from services.models.user_role_model import UserRoleModel
from services.user_role_service import UserRoleService
from services.tournaments_service import TournamentsService
from typing import Annotated
from enums.role_enum import RoleEnum
from util.role_required import RoleRequired
from util.auth import validate_session
from routes.models.user_session import UserSession

user_role_router = APIRouter(prefix="/user_role", tags=["user_role"])

@user_role_router.get("/{user_id}/{tournament_id}")
async def get_user_role(user_id: int, tournament_id: int, user_role_service: Annotated[UserRoleService, Depends(UserRoleService)],
                        user_session: Annotated[UserSession, Depends(validate_session)]):
    role = await user_role_service.get_role_by_user_id(user_id, tournament_id)
    if role is None:
        raise HTTPException(status_code=404, detail="User not found")
    return role

@user_role_router.post("/")
async def set_user_role(user_role: UserRoleModel, user_role_service: Annotated[UserRoleService, Depends(UserRoleService)],
                        tournaments_service: Annotated[TournamentsService, Depends(TournamentsService)],
                        user_session: Annotated[UserSession, Depends(validate_session)]):
    if user_role.role in [RoleEnum.ADMIN, RoleEnum.ORGANIZER]:
        if not user_session.is_admin:
            raise HTTPException(status_code=403, detail="Only global admins can assign Admin or Organizer roles")
    
    elif user_role.role == RoleEnum.JURY:
        if not user_session.is_admin:
            organizers = await tournaments_service.get_organizers(user_role.tournament_id)
            if not any(org.user_id == user_session.user_id for org in organizers):
                raise HTTPException(status_code=403, detail="Only tournament organizers can assign Jury")
                
    return await user_role_service.set_user_role(user_role)

@user_role_router.get("/role/{role_name}/{tournament_id}")
async def get_users_by_role_name(role_name: str, tournament_id: int, user_role_service: Annotated[UserRoleService, Depends(UserRoleService)],
                                 user_session: Annotated[UserSession, Depends(validate_session)]):
    return await user_role_service.get_users_by_role_name(role_name, tournament_id)