from util.database import get_db
from sqlalchemy.ext.asyncio.session import AsyncSession
from typing import Annotated, Generic, TypeVar, Type, Optional
from fastapi import Depends
from sqlalchemy import select, delete, func, or_

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

    async def get_filtered_paginated(self, limit: int, offset: int, search_text: Optional[str] = None, status: Optional[str] = None, search_fields: Optional[list] = None):
        query = select(self.model)
        count_query = select(func.count()).select_from(self.model)
        
        conditions = []
        joined_tables = set() 

        if status and hasattr(self.model, "status"):
            conditions.append(self.model.status == status)

        if search_text and search_fields:
            search_conditions = []
            
            for field in search_fields:
                field_model = field.parent.class_
                
                if field_model != self.model and field_model not in joined_tables:
                    query = query.join(field_model)
                    count_query = count_query.join(field_model)
                    joined_tables.add(field_model)
                
                search_conditions.append(field.ilike(f"%{search_text}%"))
            
            if search_conditions:
                conditions.append(or_(*search_conditions))

        if conditions:
            query = query.where(*conditions)
            count_query = count_query.where(*conditions)

        query = query.limit(limit).offset(offset)

        items_res = await self.db.execute(query)
        count_res = await self.db.execute(count_query)

        return items_res.scalars().all(), count_res.scalar_one()

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