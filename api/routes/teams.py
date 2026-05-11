from fastapi import APIRouter, Depends, HTTPException
from services import user_team_service
from services.teams_service import TeamsService
from services.tournaments_service import TournamentsService
from services.user_team_service import UserTeamService
from typing import Annotated
from services.models.team_model import TeamModel
from enums.role_enum import RoleEnum
from util.role_required import RoleRequired
from util.auth import validate_session
from routes.models.user_session import UserSession

team_router = APIRouter(prefix="/teams", tags=["teams"])

async def check_team_modify_access(team_id: int, user_session: UserSession, teams_service: TeamsService, tournaments_service: TournamentsService, user_team_service: UserTeamService):
    if user_session.is_admin:
        return

    is_leader = await user_team_service.is_user_leader(team_id, user_session.user_id)
    if is_leader:
        return

    team = await teams_service.get_team_by_id(team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
        
    organizers = await tournaments_service.get_organizers(team.tournament_id)
    if any(organizer.user_id == user_session.user_id for organizer in organizers):
        return

    raise HTTPException(status_code=403, detail="Not enough permissions to modify this team")

@team_router.get("/{team_id}")
async def get_team_by_id(team_id: int, teams_service: Annotated[TeamsService, Depends(TeamsService)],
                         user_session: Annotated[UserSession, Depends(validate_session)]):
    team = await teams_service.get_team_by_id(team_id)
    if team is None:
        raise HTTPException(status_code=404, detail="Team not found")
    return team

@team_router.get("/")
async def get_all_teams(teams_service: Annotated[TeamsService, Depends(TeamsService)],
                         user_session: Annotated[UserSession, Depends(validate_session)]):
    teams = await teams_service.get_all_teams()
    return teams

@team_router.post("/")
async def create_team(team: TeamModel, teams_service: Annotated[TeamsService, Depends(TeamsService)],
                      user_session: Annotated[UserSession, Depends(validate_session)]):
    return await teams_service.create_team(team)

@team_router.put("/{team_id}")
async def update_team(team_id: int, team: TeamModel, teams_service: Annotated[TeamsService, Depends(TeamsService)],\
                      tournaments_service: Annotated[TournamentsService, Depends(TournamentsService)],
                      user_team_service: Annotated[UserTeamService, Depends(UserTeamService)],
                      user_session: Annotated[UserSession, Depends(validate_session)]):
    await check_team_modify_access(team_id, user_session, teams_service, tournaments_service, user_team_service)

    team = await teams_service.update_team(team_id, team)
    if team is None:
        raise HTTPException(status_code=404, detail="Team not found")
    return team

@team_router.delete("/{team_id}")
async def delete_team(team_id: int, teams_service: Annotated[TeamsService, Depends(TeamsService)],
                      tournaments_service: Annotated[TournamentsService, Depends(TournamentsService)],
                      user_team_service: Annotated[UserTeamService, Depends(UserTeamService)],
                      user_session: Annotated[UserSession, Depends(RoleRequired([RoleEnum.ADMIN, RoleEnum.ORGANIZER]))]):
    team = await teams_service.get_team_by_id(team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
        
    if not user_session.is_admin:
        organizers = await tournaments_service.get_organizers(team.tournament_id)
        if not any(org.user_id == user_session.user_id for org in organizers):
            raise HTTPException(status_code=403, detail="Only organizers can delete teams")
        
    is_deleted = await teams_service.delete_team(team_id)
    if not is_deleted:
        raise HTTPException(status_code=404, detail="Team not found")
    return {"detail": "Team deleted successfully"}

@team_router.get("/tournament/{tournament_id}")
async def get_teams_by_tournament_id(tournament_id: int, teams_service: Annotated[TeamsService, Depends(TeamsService)],
                                     user_session: Annotated[UserSession, Depends(validate_session)]):
    teams = await teams_service.get_teams_by_tournament_id(tournament_id)
    return teams




