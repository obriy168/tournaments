from typing import Annotated

from fastapi import Depends
from sqlalchemy import select, and_
from sqlalchemy.orm import joinedload, selectinload, contains_eager
from sqlalchemy.ext.asyncio.session import AsyncSession

from database.schemas.schema import Task, Submission, RequirementGroup, TaskAssignment
from repositories.base_repository import BaseRepository
from util.database import get_db

class TaskRepository(BaseRepository[Task]):
    def __init__(self, db: Annotated[AsyncSession, Depends(get_db)]):
        super().__init__(model=Task, db=db)

    async def get_tasks_by_tournment(self, tournament_id):
        query = select(Task).where(Task.tournament_id == tournament_id)
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_tasks_with_details(self, tournament_id: int, team_id: int):
        query = (select(Task)
                                      .outerjoin(Submission, and_(Task.id == Submission.task_id, Submission.team_id == team_id))
                                      .options(contains_eager(Task.submissions)
                                               .selectinload(Submission.assignments)
                                               .selectinload(TaskAssignment.evaluations),
                                               selectinload(Task.requirement_groups)
                                                   .selectinload(RequirementGroup.requirements))
                                      ).where(Task.tournament_id == tournament_id)
        result = await self.db.execute(query)
        return result.scalars().unique().all()