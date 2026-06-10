from typing import Annotated

from fastapi import Depends
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio.session import AsyncSession

from database.schemas.schema import Requirement, RequirementGroup, Task
from repositories.base_repository import BaseRepository
from util.database import get_db

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
    
    async def get_tournament_id_by_group_id(self, requirement_group_id: int) -> int:
        query = select(Task.tournament_id).join(RequirementGroup).where(RequirementGroup.id == requirement_group_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    async def get_tournament_id_by_requirement_id(self, requirement_id: int):
        query = (
            select(Task.tournament_id).join(RequirementGroup, RequirementGroup.task_id == Task.id)
            .join(Requirement, Requirement.requirement_group_id == RequirementGroup.id)
            .where(Requirement.id == requirement_id)
            )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()