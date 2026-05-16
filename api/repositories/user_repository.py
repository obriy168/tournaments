from util.database import get_db
from sqlalchemy.ext.asyncio.session import AsyncSession
from sqlalchemy import select
from database.schemas.schema import User
from typing import Annotated
from fastapi import Depends
from repositories.base_repository import BaseRepository

class UserRepository(BaseRepository[User]):
    def __init__(self, db: Annotated[AsyncSession, Depends(get_db)]):
        super().__init__(model=User, db=db)

    async def get_user_by_email(self, email: str) -> User | None:
        query = select(User).where(User.email == email)
        result = await self.db.execute(query)
        return result.scalars().first()
    
    async def users_count(self):
        query = select(User)
        result = await self.db.execute(query)
        return len(result.scalars().all())
