from util.database import get_db
from sqlalchemy.ext.asyncio.session import AsyncSession
from database.schemas.schema import Evaluation, TaskAssignment, Submission
from typing import Annotated
from fastapi import Depends
from sqlalchemy import select
from repositories.base_repository import BaseRepository

class EvaluationRepository(BaseRepository[Evaluation]):
    def __init__(self, db: Annotated[AsyncSession, Depends(get_db)]):
        super().__init__(model=Evaluation, db=db)

    async def get_evaluations_by_task_id(self, task_id: int):
        query = select(Evaluation).join(TaskAssignment).join(Submission).where(Submission.task_id == task_id)
        result = await self.db.execute(query)
        return result.scalars().all()