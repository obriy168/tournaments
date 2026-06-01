from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from enums.role_enum import RoleEnum
from routes.models.login_response import LoginResponse
from routes.models.pagination_response import PaginatedResponse
from routes.models.user_response import UserResponse
from routes.models.user_session import UserSession
from routes.models.user_team_response import UserTeamResponse
from services.models.pagination_model import PaginationModel
from services.models.user_model import UserModel
from services.user_service import UserService
from util.access.role_required import RoleRequired
from util.auth import validate_session

user_router = APIRouter(prefix="/users", tags=["users"])

@user_router.get("/user/{user_id}")
async def get_user(user_id: int, users_service: Annotated[UserService, Depends(UserService)],
                   user_session: Annotated[UserSession, Depends(validate_session)]):
    user = await users_service.get_user_by_id(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@user_router.get("/email/", response_model=UserTeamResponse | None)
async def get_user_by_email(email: str, users_service: Annotated[UserService, Depends(UserService)],
                            user_session: Annotated[UserSession, Depends(validate_session)]):
    user = await users_service.get_user_by_email(email)
    return user

@user_router.get("/", response_model=list[LoginResponse])
async def get_all_users(users_service: Annotated[UserService, Depends(UserService)],
                        user_session: Annotated[UserSession, Depends(RoleRequired([RoleEnum.ADMIN]))]):
    return await users_service.get_all_users()

@user_router.get("/pagination", response_model=PaginatedResponse[UserResponse])
async def get_all_users_pagination(users_service: Annotated[UserService, Depends(UserService)],
                                   pagination: Annotated[PaginationModel, Depends()],
                                   user_session: Annotated[UserSession, Depends(RoleRequired([RoleEnum.ADMIN]))]):
    return await users_service.get_all_users_pagination(pagination)

@user_router.get("/search", response_model=PaginatedResponse[UserResponse])
async def search_tournament(users_service: Annotated[UserService, Depends(UserService)],
                            pagination: Annotated[PaginationModel, Depends()],
                            text: Optional[str] = Query(None)):
    return await users_service.search_users(text=text, pagination=pagination)

@user_router.post("/")
async def create_user(user: UserModel, users_service: Annotated[UserService, Depends(UserService)]):
    return await users_service.create_user(user)

@user_router.delete("/")
async def delete_user(user_id: int, users_service: Annotated[UserService, Depends(UserService)],
                      user_session: Annotated[UserSession, Depends(validate_session)]):
    if not user_session.is_admin and user_session.user_id != user_id:
        raise HTTPException(status_code=403, detail="You can only delete your own account")
    
    is_deleted = await users_service.delete_user(user_id)
    if not is_deleted:
        raise HTTPException(status_code=404, detail="User not found")
    return {"detail": "User deleted successfully"}