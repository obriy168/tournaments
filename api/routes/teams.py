from fastapi import APIRouter
from database.schemas.schema import Team
from services.teams_service import TeamsService
from fastapi import Depends
from typing import Annotated
from services.models.team_model import TeamModel

team_router = APIRouter(prefix="/teams", tags=["teams"])

@team_router.get("/{team_id}")
async def read_team(team_id: int, teams_service: TeamsService = Depends(TeamsService)):
    team = await teams_service.get_team_by_id(team_id)
    if team is None:
        return {"error": "Team not found"}
    return team

@team_router.get("/", dependencies=[Depends(TeamsService)])
async def read_item(teams_service: Annotated[TeamsService, Depends(TeamsService)]):
    return await teams_service.get_all_teams()

@team_router.post("/", dependencies=[Depends(TeamsService)])
async def create_team(team: TeamModel, teams_service: Annotated[TeamsService, Depends(TeamsService)]):
    return await teams_service.create_team(team)