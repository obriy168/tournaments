from util.database import get_db
from sqlalchemy.ext.asyncio.session import AsyncSession
from typing import Annotated, Generic, TypeVar, Type, Optional
from fastapi import Depends
from sqlalchemy import select, delete, func

T = TypeVar("T")

class BaseRepository(Generic[T]):
    def __init__(self, model: Type[T], db: Annotated[AsyncSession, Depends(get_db)]):
        self.db = db
        self.model = model

    async def get_by_id(self, id: int) -> Optional[T]:
        return await self.db.get(self.model, id)
    
    async def get_all(self) -> list[T]:
        result = await self.db.execute(select(self.model))
        return result.scalars().all()
    
    async def count(self) -> int:
        query = select(func.count()).select_from(self.model)
        result = await self.db.execute(query)
        return result.scalar_one()

    async def get_all_paginated(self, limit: int, offset: int) -> list[T]:
        query = select(self.model).limit(limit).offset(offset)
        result = await self.db.execute(query)
        items = result.scalars().all()

        count_query = select(func.count()).select_from(self.model)
        total_result = await self.db.execute(count_query)
        total = total_result.scalar_one()
        return items, total

    async def save(self, entity: T) -> T:
        self.db.add(entity)
        await self.db.commit()
        await self.db.refresh(entity)
        return entity
    
    async def delete(self, id: int) -> bool:
        query = delete(self.model).where(self.model.id == id)
        result = await self.db.execute(query)
        await self.db.commit()
        return result.rowcount > 0

    async def commit(self):
        await self.db.commit()
    
    async def refresh(self, entity: T):
        await self.db.refresh(entity)