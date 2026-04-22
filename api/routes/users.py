from fastapi import APIRouter
from services.user_service import UserService
from fastapi import Depends, HTTPException
from typing import Annotated
from services.models.user_model import UserModel

user_router = APIRouter(prefix="/users", tags=["users"])

@user_router.get("/{user_id}")
async def get_user(user_id: int, users_service: Annotated[UserService, Depends(UserService)]):
    user = await users_service.get_user_by_id(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@user_router.post("/")
async def create_user(user: UserModel, users_service: Annotated[UserService, Depends(UserService)]):
    return await users_service.create_user(user)

