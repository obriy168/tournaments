from repositories.user_team_repository import UserTeamRepository
from services.models.user_team_model import UserTeamModel
from database.schemas.schema import UserTeam
from typing import Annotated
from fastapi import Depends

class UserTeamService:
    def __init__(self, user_team_repository: Annotated[UserTeamRepository, Depends(UserTeamRepository)]):
        self.user_team_repository = user_team_repository

    async def create_user_team(self, team_id: int, user_id: int, is_lead: bool = False):
        existing = await self.user_team_repository.get_link(team_id, user_id)
        if existing is not None:
            return None
        
        new_user = UserTeam(user_id=user_id, 
                            team_id=team_id,
                            is_lead=is_lead)

        return await self.user_team_repository.save_user_team(new_user)
    
    async def get_teams_by_user_id(self, user_id):
        return await self.user_team_repository.get_teams_by_user_id(user_id)

    async def delete_user_in_team(self, user_team_id: int):
        return await self.user_team_repository.delete_user_from_team(user_team_id)

    async def delete_user_team_relations_by_tournament(self, tournament_id: int):
        return await self.user_team_repository.delete_user_team_relations_by_tournament(tournament_id)