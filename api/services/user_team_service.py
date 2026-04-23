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

        return await self.user_team_repository.save(new_user)
    
    async def get_teams_by_user_id(self, user_id):
        return await self.user_team_repository.get_teams_by_user_id(user_id)
    
    async def get_leader(self, team_id):
        return await self.user_team_repository.get_leader_by_team(team_id)
    
    async def change_leader(self, team_id: int, user_id: int):
        db_leader = await self.user_team_repository.get_leader_by_team(team_id)

        if db_leader and db_leader.user_id == user_id:
            return None

        if db_leader:
            db_leader.is_lead = False

        new_leader = await self.user_team_repository.get_link(team_id, user_id)

        if not new_leader:
            return None

        new_leader.is_lead = True

        await self.user_team_repository.commit()
        await self.user_team_repository.refresh(new_leader)
    
        return new_leader

    async def delete_user_in_team(self, user_team_id: int):
        user_to_del = await self.user_team_repository.get_by_id(user_team_id)
        if user_to_del is None:
            return False
        return await self.user_team_repository.delete(user_to_del)