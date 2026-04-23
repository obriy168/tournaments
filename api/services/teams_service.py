from repositories.team_repository import TeamRepository
from database.schemas.schema import Team
from services.models.team_model import TeamModel
from typing import Annotated
from fastapi import Depends

class TeamsService:
    def __init__(self, team_repository: Annotated[TeamRepository, Depends(TeamRepository)]):
        self.team_repository = team_repository

    async def get_team_by_id(self, team_id: int) -> list[Team]:
        return await self.team_repository.get_by_id(team_id)

    async def get_all_teams(self):
        return await self.team_repository.get_all()
    
    async def create_team(self, team: TeamModel) -> Team:
        data = team.model_dump(exclude={"id"})
        team_entity = Team(**data)
        return await self.team_repository.save(team_entity)

    async def update_team(self, team_id: int, team: TeamModel) -> Team:
        db_team = await self.team_repository.get_by_id(team_id)

        if not db_team:
            return None
        new_team = team.model_dump(exclude_unset=True, exclude={"id"})

        db_team.sqlmodel_update(new_team)

        return await self.team_repository.save(db_team)

    async def delete_team(self, team_id: int) -> bool:
        team = await self.team_repository.get_by_id(team_id)
        if team is None:
            return False
        return await self.team_repository.delete(team)

    async def get_teams_by_tournament_id(self, tournament_id: int) -> list[Team]:
        return await self.team_repository.get_teams_by_tournament_id(tournament_id)