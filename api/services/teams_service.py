from repositories.team_repository import TeamRepository
from database.schemas.schema import Team
from services.models.team_model import TeamModel
from typing import Annotated
from fastapi import Depends

class TeamsService:
    def __init__(self, team_repository: Annotated[TeamRepository, Depends(TeamRepository)]):
        self.team_repository = team_repository

    async def get_all_teams(self):
        return await self.team_repository.get_teams()

    async def get_team_by_id(self, team_id: int):
        return await self.team_repository.get_team(team_id)
    
    async def create_team(self, team: TeamModel) -> Team:
        team_entity = Team(
            tournament_id=team.tournament_id,
            name=team.name,
            city=team.city,
            organization=team.organization
        )
        return await self.team_repository.create_team(team_entity)