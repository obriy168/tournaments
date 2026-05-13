from util.database import get_db
from sqlalchemy.ext.asyncio.session import AsyncSession
from database.schemas.schema import TaskAssignment, Submission
from typing import Annotated
from fastapi import Depends
from sqlalchemy import select, delete
from repositories.base_repository import BaseRepository

class TaskAssignmentRepository(BaseRepository[TaskAssignment]):
    def __init__(self, db: Annotated[AsyncSession, Depends(get_db)]):
        super().__init__(model=TaskAssignment, db=db)

    async def get_tasks_assignment_by_evaluator_id(self, evaluator_id: int):
        query = select(TaskAssignment).where(TaskAssignment.evaluator_id == evaluator_id)
        result = await self.db.execute(query)
        return result.scalars().all()

    async def save_all_tasks(self, task_assignments: list[TaskAssignment]) -> list[TaskAssignment]:
        self.db.add_all(task_assignments)
        await self.db.commit()

        for task in task_assignments:
            await self.db.refresh(task)

        return task_assignments

    async def delete_assignments_by_task_id(self, task_id: int):
        submissions_subquery = select(Submission.id).where(Submission.task_id == task_id)
    
        query = delete(TaskAssignment).where(
            TaskAssignment.submission_id.in_(submissions_subquery)
        )

        await self.db.execute(query)
        await self.db.commit()