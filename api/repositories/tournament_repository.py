from util.database import get_db
from sqlalchemy.ext.asyncio.session import AsyncSession
from database.schemas.schema import Tournament
from typing import Annotated
from fastapi import Depends
from sqlalchemy.future import select

class TournamentRepository:
    def __init__(self, db: Annotated[AsyncSession, Depends(get_db)]):
        self.db = db

    async def get_tournament(self, tournament_id: int) -> Tournament:
        return await self.db.get(Tournament, tournament_id)
    
    async def get_tournaments(self) -> list[Tournament]:
        result = await self.db.execute(select(Tournament))
        return result.scalars().all()

    async def save_tournament(self, tournament: Tournament) -> Tournament:
        self.db.add(tournament)
        await self.db.commit()
        await self.db.refresh(tournament)
        return tournament

    async def delete_tournament(self, tournament_id: int) -> bool:
        tournament = await self.get_tournament(tournament_id)
        if tournament is None:
            return False
        await self.db.delete(tournament)
        await self.db.commit()
        return True
