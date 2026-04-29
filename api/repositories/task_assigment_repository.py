from util.database import get_db
from sqlalchemy.ext.asyncio.session import AsyncSession
from database.schemas.schema import TaskAssignment
from typing import Annotated
from fastapi import Depends
from sqlalchemy import select
from repositories.base_repository import BaseRepository

class TaskAssignmentRepository(BaseRepository[TaskAssignment]):
    def __init__(self, db: Annotated[AsyncSession, Depends(get_db)]):
        super().__init__(model=TaskAssignment, db=db)

    async def get_tasks_assignment_by_evaluator_id(self, evaluator_id: int):
        query = select(TaskAssignment).where(TaskAssignment.evaluator_id == evaluator_id)
        result = await self.db.execute(query)
        return result