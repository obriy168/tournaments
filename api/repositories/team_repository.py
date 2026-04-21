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
    
    async def save_team(self, team: Team) -> Team:
        self.db.add(team)
        await self.db.commit()
        await self.db.refresh(team)
        return team
    
    async def delete_team(self, team_id: int) -> bool:
        team = await self.get_team(team_id)
        if team is None:
            return False
        await self.db.delete(team)
        await self.db.commit()
        return True