from fastapi import APIRouter, Depends, HTTPException
from services.teams_service import TeamsService
from typing import Annotated
from services.models.team_model import TeamModel
from util.role_required import TeamAccess
from util.auth import validate_session
from routes.models.user_session import UserSession

team_router = APIRouter(prefix="/teams", tags=["teams"])

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
async def update_team(team_id: int, team: TeamModel, teams_service: Annotated[TeamsService, Depends(TeamsService)],
                      user_session: Annotated[UserSession, Depends(TeamAccess.can_modify_team)]):
    team = await teams_service.update_team(team_id, team)
    if team is None:
        raise HTTPException(status_code=404, detail="Team not found")
    return team

@team_router.delete("/{team_id}")
async def delete_team(team_id: int, teams_service: Annotated[TeamsService, Depends(TeamsService)],
                      user_session: Annotated[UserSession, Depends(TeamAccess.can_modify_team)]):
    team = await teams_service.get_team_by_id(team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
        
    is_deleted = await teams_service.delete_team(team_id)
    if not is_deleted:
        raise HTTPException(status_code=404, detail="Team not found")
    return {"detail": "Team deleted successfully"}

@team_router.get("/tournament/{tournament_id}")
async def get_teams_by_tournament_id(tournament_id: int, teams_service: Annotated[TeamsService, Depends(TeamsService)],
                                     user_session: Annotated[UserSession, Depends(validate_session)]):
    teams = await teams_service.get_teams_by_tournament_id(tournament_id)
    return teams
