from repositories.team_repository import TeamRepository
from typing import Annotated
from fastapi import Depends

class TeamsService:
    def __init__(self, team_repository: Annotated[TeamRepository, Depends(TeamRepository)]):
        self.team_repository = team_repository

    async def get_all_teams(self):
        return await self.team_repository.get_teams()

    async def get_team_by_id(self, team_id):
        return await self.team_repository.get_team(team_id)