from util.database import get_db
from sqlalchemy.ext.asyncio.session import AsyncSession
from database.schemas.schema import User
from typing import Annotated
from fastapi import Depends
from sqlalchemy.future import select

class UserRepository:
    def __init__(self, db: Annotated[AsyncSession, Depends(get_db)]):
        self.db = db

    async def get_user(self, user_id: int) -> User:
        return await self.db.get(User, user_id)

    async def save_user(self, user: User) -> User:
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user
