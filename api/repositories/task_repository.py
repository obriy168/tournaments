from util.database import get_db
from sqlalchemy.ext.asyncio.session import AsyncSession
from database.schemas.schema import Task
from typing import Annotated
from fastapi import Depends
from sqlalchemy import select, delete

class TaskRepository:
    def __init__(self, db: Annotated[AsyncSession, Depends(get_db)]):
        self.db = db

    async def get_task(self, task_id: int) -> Task:
        return await self.db.get(Task, task_id)

    async def save_task(self, task: Task) -> Task:
        self.db.add(task)
        await self.db.commit()
        await self.db.refresh(task)
        return task

    async def get_tasks_by_tournment(self, tournament_id):
        query = select(Task).where(Task.tournament_id == tournament_id)
        result = await self.db.execute(query)
        return result.scalars().all()

    async def delete_task(self, task: Task) -> bool:
        await self.db.delete(task)
        await self.db.commit()
        return True
    
    async def delete_tasks_by_tournament(self, tournament_id: int):
        query = delete(Task).where(Task.tournament_id == tournament_id)
        await self.db.execute(query)
        return True


