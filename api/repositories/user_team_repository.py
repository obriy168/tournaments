from util.database import get_db
from sqlalchemy.ext.asyncio.session import AsyncSession
from database.schemas.schema import UserTeam, Team
from typing import Annotated
from fastapi import Depends
from sqlalchemy import select, delete

class UserTeamRepository:
    def __init__(self, db: Annotated[AsyncSession, Depends(get_db)]):
        self.db = db

    async def get_user_team(self, user_team_id):
        return await self.db.get(UserTeam, user_team_id)
    
    async def get_teams_by_user_id(self, user_id):
        query = select(Team).join(UserTeam).where(UserTeam.user_id == user_id)
        result = await self.db.execute(query)

        return result.scalars().all()

    async def get_link(self, team_id: int, user_id: int):
        query = select(UserTeam).where(UserTeam.user_id == user_id, UserTeam.team_id == team_id)
        result = await self.db.execute(query)
        return result.scalars().first()
    
    async def save_user_team(self, user_team: UserTeam):
        self.db.add(user_team)
        await self.db.commit()
        await self.db.refresh(user_team)
        return user_team

    async def delete_user_from_team(self, user_team_id) -> bool:
        user_to_del = await self.get_user_team(user_team_id)
        if user_to_del is None:
            return False
        await self.db.delete(user_to_del)
        await self.db.commit()
        return True
    
    async def delete_user_team_relations_by_tournament(self, tournament_id: int):
        teams_query = select(Team.id).where(Team.tournament_id == tournament_id)
        query = delete(UserTeam).where(UserTeam.team_id.in_(teams_query))
        await self.db.execute(query)

