from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from services.user_service import UserService
from typing import Annotated
from services.models.user_model import UserModel, UserRead
from services.models.token_model import Token
import util.security as security_utils

user_router = APIRouter(prefix="/users", tags=["users"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="users/login")

@user_router.get("/{user_id}")
async def get_user(user_id: int, users_service: Annotated[UserService, Depends(UserService)]):
    user = await users_service.get_user_by_id(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@user_router.get("/")
async def get_all_users(users_service: Annotated[UserService, Depends(UserService)]):
    return await users_service.get_all_users()

@user_router.post("/", response_model=UserRead)
async def create_user(user: UserModel, users_service: Annotated[UserService, Depends(UserService)]):
    return await users_service.create_user(user)

@user_router.post("/login", response_model=Token)
async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], user_service: Annotated[UserService, Depends(UserService)]):
    user = await user_service.authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    access_token = security_utils.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@user_router.delete("/{user_id}")
async def delete_user(user_id: int, users_service: Annotated[UserService, Depends(UserService)]):
    return await users_service.delete_user(user_id)