from util.database import get_db
from sqlalchemy.ext.asyncio.session import AsyncSession
from database.schemas.schema import Team
from typing import Annotated
from fastapi import Depends
from sqlalchemy import select
from repositories.base_repository import BaseRepository

class TeamRepository(BaseRepository[Team]):
    def __init__(self, db: Annotated[AsyncSession, Depends(get_db)]):
        super().__init__(model=Team, db=db)
    
    async def get_teams_by_tournament_id(self, tournament_id: int):
        query = select(Team).where(Team.tournament_id == tournament_id)
    
        teams = await self.db.execute(query)
        return teams.scalars().all()
    
    async def create_team_without_commit(self, team: Team):
        self.db.add(team)
        await self.db.flush()
        return team