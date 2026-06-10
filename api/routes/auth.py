from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response

from routes.models.login_model import LoginModel
from routes.models.login_response import LoginResponse
from routes.models.user_role_model import UserRoleModel
from routes.models.user_session import UserSession

from services.errors.user_existed import UserExistedException
from services.models.user_model import UserModel
from services.user_role_service import UserRoleService
from services.user_service import UserService

from util.auth import validate_session

auth_router = APIRouter(prefix="/auth", tags=["auth"])

@auth_router.post("/login")
async def login(model: LoginModel, user_service: Annotated[UserService, Depends(UserService)], response: Response,
                user_role_service: Annotated[UserRoleService, Depends(UserRoleService)]):
    user = await user_service.login(model.email, model.password)
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    user_roles = await user_role_service.get_all_userroles(user.id)

    ur = [UserRoleModel(user_id=user.id, role=user_role.role, tournament_id=user_role.tournament_id) for user_role in user_roles]
    
    user_session = UserSession(user_id=user.id, email=user.email, 
                                roles=ur)
    
    response.set_cookie(key="session_id", value=user_session.model_dump_json(), httponly=True, path="/", samesite="lax", secure=False)

    return {"detail": "Login successful"}

@auth_router.get("/me")
async def get_current_user(user_service: Annotated[UserService, Depends(UserService)],
                           user_role_service: Annotated[UserRoleService, Depends(UserRoleService)],
                           user_session: Annotated[UserSession, Depends(validate_session)]):
    if user_session is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    user = await user_service.get_user_by_id(int(user_session.user_id))
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    data = user.model_dump(exclude={"password"})
    user_data = LoginResponse(**data)

    user_roles = await user_role_service.get_all_userroles(user.id)

    ur = [UserRoleModel(user_id=user.id, role=user_role.role, tournament_id=user_role.tournament_id) for user_role in user_roles]
    user_data.roles = ur
    
    return user_data

@auth_router.post("/logout")
async def logout(response: Response, user_session: Annotated[UserSession, Depends(validate_session)]):
    response.delete_cookie(key="session_id", path="/")
    return {"detail": "Logout successful"}

@auth_router.post("/register")
async def register(user: UserModel, user_service: Annotated[UserService, Depends(UserService)]):
    try:    
        created_user = await user_service.create_user(user)
        return created_user
    except UserExistedException as e:
        raise HTTPException(status_code=400, detail=str(e))    