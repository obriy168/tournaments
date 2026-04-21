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
        data = team.model_dump(exclude={"id"})
        team_entity = Team(**data)
        return await self.team_repository.save_team(team_entity)

    async def update_team(self, team_id: int, team: TeamModel) -> Team:
        db_team = await self.team_repository.get_team(team_id)

        if not db_team:
            return None
        new_team = team.model_dump(exclude_unset=True, exclude={"id"})

        db_team.sqlmodel_update(new_team)

        return await self.team_repository.save_team(db_team)

    async def delete_team(self, team_id: int) -> bool:
        return await self.team_repository.delete_team(team_id)


