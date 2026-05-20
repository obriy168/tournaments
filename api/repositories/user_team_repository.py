from typing import Annotated

from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database.schemas.schema import User, UserTeam, Team
from repositories.base_repository import BaseRepository
from util.database import get_db

class UserTeamRepository(BaseRepository[UserTeam]):
    def __init__(self, db: Annotated[AsyncSession, Depends(get_db)]):
        super().__init__(model=UserTeam, db=db)

    async def get_teams_by_user_id(self, user_id):
        query = select(Team).join(UserTeam).where(UserTeam.user_id == user_id)
        result = await self.db.execute(query)
        return result.scalars().all()

    async def get_users_by_team_id(self, team_id):
        query = select(User, UserTeam.is_lead).join(UserTeam, User.id == UserTeam.user_id).where(UserTeam.team_id == team_id).order_by(UserTeam.is_lead.desc())
        result = await self.db.execute(query)
        return result.all()

    async def get_link(self, team_id: int, user_id: int):
        query = select(UserTeam).where(UserTeam.user_id == user_id, UserTeam.team_id == team_id)
        result = await self.db.execute(query)
        return result.scalars().first()

    async def get_leader_by_team(self, team_id):
        query = select(UserTeam).where(UserTeam.is_lead == True, UserTeam.team_id == team_id)
        leader = await self.db.execute(query)
        return leader.scalars().first()

    async def is_user_leader(self, team_id: int, user_id: int) -> bool:
        query = select(UserTeam).where(UserTeam.is_lead == True, UserTeam.team_id == team_id, UserTeam.user_id == user_id)
        result = await self.db.execute(query)
        return result.scalars().first() is not None
    
    async def get_by_user_and_team(self, user_id: int, team_id: int):
        query = select(UserTeam).where(UserTeam.team_id == team_id, UserTeam.user_id == user_id)
        result = await self.db.execute(query)
        return result.scalars().first()

    async def delete_entity(self, user_team: UserTeam) -> bool:
        await self.db.delete(user_team)
        await self.db.commit()
        return True