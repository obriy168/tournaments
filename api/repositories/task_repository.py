from util.database import get_db
from sqlalchemy.ext.asyncio.session import AsyncSession
from database.schemas.schema import Task
from typing import Annotated
from fastapi import Depends
from sqlalchemy import select
from repositories.base_repository import BaseRepository

class TaskRepository(BaseRepository[Task]):
    def __init__(self, db: Annotated[AsyncSession, Depends(get_db)]):
        super().__init__(model=Task, db=db)

    async def get_tasks_by_tournment(self, tournament_id):
        query = select(Task).where(Task.tournament_id == tournament_id)
        result = await self.db.execute(query)
        return result.scalars().all()