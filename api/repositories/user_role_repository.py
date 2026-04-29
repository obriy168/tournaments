from util.database import get_db
from sqlalchemy.ext.asyncio.session import AsyncSession
from database.schemas.schema import UserRole
from typing import Annotated
from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from repositories.base_repository import BaseRepository

class UserRoleRepository(BaseRepository[UserRole]):
    def __init__(self, db: Annotated[AsyncSession, Depends(get_db)]):
        super().__init__(model=UserRole, db=db)

    async def get_role_by_user_id(self, user_id: int, tournament_id: int):
        query = select(UserRole).where(UserRole.user_id == user_id, UserRole.tournament_id == tournament_id)
        result = await self.db.execute(query)
        return result.scalars().first()
