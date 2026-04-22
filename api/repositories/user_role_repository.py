from util.database import get_db
from sqlalchemy.ext.asyncio.session import AsyncSession
from database.schemas.schema import UserRole, Role
from typing import Annotated
from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.orm import selectinload

class UserRoleRepository:
    def __init__(self, db: Annotated[AsyncSession, Depends(get_db)]):
        self.db = db

    async def get_role_by_user_id(self, user_id: int, tournament_id: int):
        query = select(UserRole).where(UserRole.user_id == user_id, UserRole.tournament_id == tournament_id).options(selectinload(UserRole.role))
        result = await self.db.execute(query)
        return result.scalars().first().role.name
    
    async def save_user_role(self, user_role: UserRole):
        self.db.add(user_role)
        await self.db.commit()
        await self.db.refresh(user_role)
        return user_role
