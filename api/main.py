from fastapi import FastAPI, Depends
from routes.tournaments import tournament_router
from routes.teams import team_router
from repositories.team_repository import TeamRepository
from services.teams_service import TeamsService
from util.database import get_db



app = FastAPI(dependencies=[Depends(get_db), Depends(TeamRepository), Depends(TeamsService)])
    
app.include_router(tournament_router)
app.include_router(team_router)
