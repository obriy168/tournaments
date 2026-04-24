from util.database import get_db
from sqlalchemy.ext.asyncio.session import AsyncSession
from database.schemas.schema import Requirement, RequirementGroup
from typing import Annotated
from fastapi import Depends
from sqlalchemy import select, delete
from repositories.base_repository import BaseRepository

class RequirementRepository(BaseRepository[Requirement]):
    def __init__(self, db: Annotated[AsyncSession, Depends(get_db)]):
        super().__init__(model=Requirement, db=db)

    async def get_requirements_by_task_id(self, task_id: int):
        query = (
            select(Requirement)
            .join(RequirementGroup)
            .where(RequirementGroup.task_id == task_id)
        )
        result = await self.db.execute(query)
        return result.scalars().all()

    async def delete_requirements(self, ids: list[int]) -> bool:
        query = delete(Requirement).where(Requirement.id.in_(ids))
        await self.db.execute(query)
        await self.db.commit()
        return True