from fastapi import APIRouter, Depends, HTTPException
from services.models.user_role_model import UserRoleModel
from services.user_role_service import UserRoleService
from typing import Annotated

user_role_router = APIRouter(prefix="/user_role", tags=["user_role"])

@user_role_router.get("/{user_id}/{tournament_id}")
async def get_user_role(user_id: int, tournament_id: int, user_role_service: Annotated[UserRoleService, Depends(UserRoleService)]):
    role = await user_role_service.get_role_by_user_id(user_id, tournament_id)
    if role is None:
        raise HTTPException(status_code=404, detail="User not found")
    return role

@user_role_router.post("/")
async def set_user_role(user_role: UserRoleModel, user_role_service: Annotated[UserRoleService, Depends(UserRoleService)]):
    return await user_role_service.set_user_role(user_role)

@user_role_router.get("/role/{role_name}/{tournament_id}")
async def get_users_by_role_name(role_name: str, tournament_id: int, user_role_service: Annotated[UserRoleService, Depends(UserRoleService)]):
    return await user_role_service.get_users_by_role_name(role_name, tournament_id)