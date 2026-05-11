from fastapi import APIRouter, Depends, HTTPException
from services.user_team_service import UserTeamService
from services.tournaments_service import TournamentsService
from typing import Annotated
from enums.role_enum import RoleEnum
from util.role_required import RoleRequired
from util.auth import validate_session
from routes.models.user_session import UserSession

user_team_router = APIRouter(prefix="/users_team", tags=["users_team"])

async def check_tournament_or_leader_access(team_id: int, user_session: UserSession, user_team_service: UserTeamService, tournaments_service: TournamentsService):
    if user_session.is_admin:
        return
    
    is_leader = await user_team_service.is_user_leader(team_id, user_session.user_id)
    if is_leader:
        return

    tournament_id = await tournaments_service.get_tournament_id_by_team(team_id)
    organizers = await tournaments_service.get_organizers(tournament_id)
    if any(org.user_id == user_session.user_id for org in organizers):
        return

    raise HTTPException(status_code=403, detail="Only team leader or tournament organizer can modify team")

@user_team_router.get("/{user_id}")
async def get_teams_by_user_id(user_id: int, user_team_service: Annotated[UserTeamService, Depends(UserTeamService)],
                               user_session: Annotated[UserSession, Depends(validate_session)]):
    return await user_team_service.get_teams_by_user_id(user_id)

@user_team_router.get("/leader/{team_id}")
async def get_leader(team_id: int, user_team_service: Annotated[UserTeamService, Depends(UserTeamService)],
                     user_session: Annotated[UserSession, Depends(validate_session)]):
    return await user_team_service.get_leader(team_id)

@user_team_router.get("/{team_id}/members")
async def get_users_by_team_id(team_id: int, user_team_service: Annotated[UserTeamService, Depends(UserTeamService)],
                               user_session: Annotated[UserSession, Depends(validate_session)]):
    return await user_team_service.get_users_by_team_id(team_id)

@user_team_router.get("/is_leader/{team_id}/{user_id}")
async def is_user_leader(team_id: int, user_id: int, user_team_service: Annotated[UserTeamService, Depends(UserTeamService)],
                         user_session: Annotated[UserSession, Depends(validate_session)]):
    return await user_team_service.is_user_leader(team_id, user_id)

@user_team_router.post("/{team_id}/{user_id}")
async def add_user_to_team(team_id: int, user_id: int, user_team_service: Annotated[UserTeamService, Depends(UserTeamService)],
                           tournaments_service: Annotated[TournamentsService, Depends(TournamentsService)],
                           user_session: Annotated[UserSession, Depends(validate_session)]):
    await check_tournament_or_leader_access(team_id, user_session, user_team_service, tournaments_service)

    user = await user_team_service.create_user_team(team_id, user_id)
    if user is None:
        raise HTTPException(status_code=400, detail= "User alredy in a team")
    return user

@user_team_router.patch("/change_leader/{team_id}/{user_id}")
async def change_leader(team_id: int, user_id: int, user_team_service: Annotated[UserTeamService, Depends(UserTeamService)],
                        tournaments_service: Annotated[TournamentsService, Depends(TournamentsService)],
                        user_session: Annotated[UserSession, Depends(validate_session)]):
    await check_tournament_or_leader_access(team_id, user_session, user_team_service, tournaments_service)
    return await user_team_service.change_leader(team_id, user_id)

@user_team_router.delete("/{user_team_id}")
async def delete_user_from_team(user_team_id: int, user_team_service: Annotated[UserTeamService, Depends(UserTeamService)],
                                tournaments_service: Annotated[TournamentsService, Depends(TournamentsService)],
                                user_session: Annotated[UserSession, Depends(validate_session)]):
    user_team = await user_team_service.get_user_team_by_id(user_team_id)
    if not user_team:
        raise HTTPException(status_code=404, detail="Record not found")

    if user_team.user_id != user_session.user_id:
        await check_tournament_or_leader_access(user_team.team_id, user_session, user_team_service, tournaments_service)
        
    is_deleted = await user_team_service.delete_user_in_team(user_team_id)
    if not is_deleted:
        raise HTTPException(status_code=404, detail="User not found")
    return {"detail": "User deleted successfully from team"}
