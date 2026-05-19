from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from database.schemas.schema import Team, Tournament, UserRole
from enums.role_enum import RoleEnum
from repositories.base_repository import BaseRepository
from util.database import get_db


class TournamentRepository(BaseRepository[Tournament]):
    def __init__(self, db: Annotated[AsyncSession, Depends(get_db)]):
        super().__init__(model=Tournament, db=db)

    async def get_organizers_by_tournament_id(self, tournament_id: int):
        query = select(UserRole).where(UserRole.tournament_id == tournament_id, UserRole.role == RoleEnum.ORGANIZER)

        result = await self.db.execute(query)
        organizers = result.scalars().all()
        return organizers

    async def get_tournament_id_by_team_id(self, team_id: int):
        query = select(Team.tournament_id).where(Team.id == team_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()