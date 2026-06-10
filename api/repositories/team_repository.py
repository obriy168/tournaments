from typing import Annotated

from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio.session import AsyncSession

from database.schemas.schema import Team
from repositories.base_repository import BaseRepository
from util.database import get_db

class TeamRepository(BaseRepository[Team]):
    def __init__(self, db: Annotated[AsyncSession, Depends(get_db)]):
        super().__init__(model=Team, db=db)
    
    async def get_teams_by_tournament_id(self, tournament_id: int):
        query = select(Team).where(Team.tournament_id == tournament_id)
    
        teams = await self.db.execute(query)
        return teams.scalars().all()
    
    async def save_team_with_users(self, entity: Team) -> Team:
        self.db.add(entity)
        await self.db.commit()
    
        query = select(Team).options(selectinload(Team.user_teams)).where(Team.id == entity.id)
        result = await self.db.execute(query)
        return result.scalars().first()