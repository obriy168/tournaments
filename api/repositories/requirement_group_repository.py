from typing import Annotated

from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database.schemas.schema import RequirementGroup, Task
from repositories.base_repository import BaseRepository
from util.database import get_db

class RequirementGroupRepository(BaseRepository[RequirementGroup]):
    def __init__(self, db: Annotated[AsyncSession, Depends(get_db)]):
        super().__init__(model=RequirementGroup, db=db)

    async def get_requirements_group_by_task(self, task_id: int):
        query = select(RequirementGroup).where(RequirementGroup.task_id == task_id)
        result = await self.db.execute(query)
        return result.scalars().all()

    async def get_tournament_id_by_task_id(self, task_id: int) -> int:
        query = select(Task).where(Task.id == task_id)
        result = await self.db.execute(query)
        task = result.scalar_one_or_none()
        
        return task.tournament_id if task else None