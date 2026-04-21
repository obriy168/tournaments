from fastapi import FastAPI, Depends

from routes.tournaments import tournament_router
from routes.teams import team_router
from routes.users import user_router

from repositories.team_repository import TeamRepository
from repositories.tournament_repository import TournamentRepository
from repositories.user_repository import UserRepository

from services.teams_service import TeamsService
from services.tournaments_service import TournamentsService
from services.user_service import UserService

from util.database import get_db

app = FastAPI(dependencies=[Depends(get_db), Depends(TeamRepository), Depends(TeamsService),
                                             Depends(TournamentRepository), Depends(TournamentsService),
                                             Depends(UserRepository), Depends(UserService)])
    
app.include_router(tournament_router)
app.include_router(team_router)
app.include_router(user_router)
