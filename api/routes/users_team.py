from fastapi import APIRouter
from services.user_team_service import UserTeamService
from fastapi import Depends, HTTPException
from typing import Annotated
from services.models.user_team_model import UserTeamModel

user_team_router = APIRouter(prefix="/users_team", tags=["users_team"])

@user_team_router.post("/{team_id}/{user_id}")
async def add_user_to_team(team_id: int, user_id: int, user_team_service: Annotated[UserTeamService, Depends(UserTeamService)]):
    user = await user_team_service.create_user_team(team_id, user_id)
    if user is None:
        raise HTTPException(status_code=400, detail= "User alredy in a team")
    return user

@user_team_router.get("/{user_id}")
async def get_teams_by_user_id(user_id: int, user_team_service: Annotated[UserTeamService, Depends(UserTeamService)]):
    return await user_team_service.get_teams_by_user_id(user_id)

@user_team_router.delete("/{user_team_id}")
async def delete_user_from_team(user_team_id: int, user_team_service: Annotated[UserTeamService, Depends(UserTeamService)]):
    is_deleted = await user_team_service.delete_user_in_team(user_team_id)
    if not is_deleted:
        raise HTTPException(status_code=404, detail="User not found")
    return {"detail": "User deleted successfully from team"}







