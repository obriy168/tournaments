from fastapi import APIRouter, Depends, HTTPException
from util.auth import validate_session
from services.user_service import UserService
from typing import Annotated
from services.models.user_model import UserModel
from enums.role_enum import RoleEnum
from util.access.role_required import RoleRequired
from util.auth import validate_session
from routes.models.user_session import UserSession
from routes.models.user_team_response import UserTeamResponse
from routes.models.login_response import LoginResponse

user_router = APIRouter(prefix="/users", tags=["users"])

@user_router.get("/{user_id}")
async def get_user(user_id: int, users_service: Annotated[UserService, Depends(UserService)],
                   user_session: Annotated[UserSession, Depends(validate_session)]):
    user = await users_service.get_user_by_id(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@user_router.get("/email/", response_model=UserTeamResponse)
async def get_user_by_email(email: str, users_service: Annotated[UserService, Depends(UserService)],
                            user_session: Annotated[UserSession, Depends(validate_session)]):
    return await users_service.get_user_by_email(email)

@user_router.get("/", response_model=LoginResponse)
async def get_all_users(users_service: Annotated[UserService, Depends(UserService)],
                        user_session: Annotated[UserSession, Depends(RoleRequired([RoleEnum.ADMIN]))]):
    return await users_service.get_all_users()

@user_router.post("/")
async def create_user(user: UserModel, users_service: Annotated[UserService, Depends(UserService)]):
    return await users_service.create_user(user)

@user_router.delete("")
async def delete_user(user_id: int, users_service: Annotated[UserService, Depends(UserService)],
                      user_session: Annotated[UserSession, Depends(validate_session)]):
    if not user_session.is_admin and user_session.user_id != user_id:
        raise HTTPException(status_code=403, detail="You can only delete your own account")
    
    is_deleted = await users_service.delete_user(user_id)
    if not is_deleted:
        raise HTTPException(status_code=404, detail="User not found")
    return {"detail": "User deleted successfully"}