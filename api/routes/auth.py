from fastapi import APIRouter, Depends, HTTPException, Response, Cookie
from services.errors.user_existed import UserExistedException
from services.models.user_model import UserModel
from services.user_service import UserService
from typing import Annotated
from routes.models.login_model import LoginModel


auth_router = APIRouter(prefix="/auth", tags=["auth"])

@auth_router.post("/login")
async def login(model: LoginModel, user_service: Annotated[UserService, Depends(UserService)], response: Response):
    user = await user_service.login(model.email, model.password)
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    response.set_cookie(key="session_id", value=str(user.id), httponly=True, path="/", samesite="lax", secure=False)

    return {"detail": "Login successful"}

@auth_router.get("/me")
async def get_current_user(user_service: Annotated[UserService, Depends(UserService)], session_id: Annotated[str | None, Cookie()] = None):
    if session_id is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    user = await user_service.get_user_by_id(int(session_id))
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    data = user.model_dump(exclude={"password"})
    user_data = UserModel(**data)
    
    return user_data

@auth_router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(key="session_id", path="/")
    return {"detail": "Logout successful"}

@auth_router.post("/register")
async def register(user: UserModel, user_service: Annotated[UserService, Depends(UserService)]):
    try:    
        created_user = await user_service.create_user(user)
        return created_user
    except UserExistedException as e:
        raise HTTPException(status_code=400, detail=str(e))    