from util.database import get_db
from sqlalchemy.ext.asyncio.session import AsyncSession
from database.schemas.schema import Team
from typing import Annotated
from fastapi import Depends
from sqlalchemy.future import select



class TeamRepository:
    def __init__(self, db: Annotated[AsyncSession, Depends(get_db)]):
        self.db = db

    async def get_team(self, team_id: int) -> Team:
        return await self.db.get(Team, team_id)
    
    async def get_teams(self) -> list[Team]:
        result = await self.db.execute(select(Team))
        return result.scalars().all()