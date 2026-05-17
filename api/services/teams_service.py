from repositories.team_repository import TeamRepository
from services.user_team_service import UserTeamService
from database.schemas.schema import Team, UserTeam
from services.models.team_model import TeamModel, TeamRegistrationModel
from services.models.pagination_model import PaginationModel
from typing import Annotated
from fastapi import Depends
import math

class TeamsService:
    def __init__(self, team_repository: Annotated[TeamRepository, Depends(TeamRepository)],
                       user_team_service: Annotated[UserTeamService, Depends(UserTeamService)]):
        self.team_repository = team_repository
        self.user_team_service = user_team_service

    async def get_team_by_id(self, team_id: int) -> Team:
        return await self.team_repository.get_by_id(team_id)

    async def get_all_teams(self):
        return await self.team_repository.get_all()
    
    async def get_all_teams_pagination(self, pagination: PaginationModel):
        teams, total_count = await self.team_repository.get_all_paginated(limit=pagination.limit, offset=pagination.offset)
        
        return {
            "items": teams,
            "meta": {
                "page": pagination.page,
                "page_size": pagination.limit,
                "total": total_count,
                "pages": math.ceil(total_count / pagination.limit)
            }
        }

    async def create_team(self, team: TeamRegistrationModel) -> TeamRegistrationModel:
        team_entity = Team(**team.model_dump(exclude={"id", "user_teams"}),
                      user_teams=[
                          UserTeam(**user.model_dump(exclude={"id"})) 
                          for user in team.user_teams])
        
        saved_team = await self.team_repository.save_team_with_users(team_entity)
        return TeamRegistrationModel.model_validate(saved_team)
    
    async def update_team(self, team_id: int, team: TeamModel) -> Team:
        db_team = await self.team_repository.get_by_id(team_id)

        if not db_team:
            return None
        new_team = team.model_dump(exclude_unset=True, exclude={"id"})

        db_team.sqlmodel_update(new_team)

        return await self.team_repository.save(db_team)

    async def delete_team(self, team_id: int) -> bool:
        return await self.team_repository.delete(team_id)

    async def get_teams_by_tournament_id(self, tournament_id: int) -> list[Team]:
        return await self.team_repository.get_teams_by_tournament_id(tournament_id)