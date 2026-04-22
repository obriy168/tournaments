from repositories.task_repository import TaskRepository
from database.schemas.schema import Task, TaskStatus
from services.models.task_model import TaskModel
from typing import Annotated
from fastapi import Depends

class TaskService:
    def __init__(self, task_repository: Annotated[TaskRepository, Depends(TaskRepository)]):
        self.task_repository = task_repository

    async def get_task_by_id(self, task_id: int):
        return await self.task_repository.get_task(task_id)
    
    async def create_task(self, task: TaskModel) -> Task:
        data = task.model_dump(exclude={"id"})
        Task_entity = Task(**data)
        return await self.task_repository.save_task(Task_entity)

    async def update_task(self, task_id: int, task: TaskModel) -> Task:
        db_task = await self.task_repository.get_task(task_id)

        if not db_task:
            return None
        
        new_task = task.model_dump(exclude_unset=True, exclude={"id"})
        db_task.sqlmodel_update(new_task)

        return await self.task_repository.save_task(db_task)

    async def update_task_status(self, task_id: int, status: str):
        db_task = await self.get_task_by_id(task_id)

        if db_task is None:
            return None
        
        allowed_transitions = {
            TaskStatus.DRAFT: [TaskStatus.ACTIVE],
            TaskStatus.ACTIVE: [TaskStatus.SUBMISSION_CLOSED],
            TaskStatus.SUBMISSION_CLOSED: [TaskStatus.EVALUATED],
            TaskStatus.EVALUATED: []
        }

        if db_task.status == status:
            return None
        
        if status not in allowed_transitions.get(db_task.status, []):
            return None
        
        db_task.status = status
    
        return await self.task_repository.save_task(db_task)

    async def get_tasks_by_tournment(self, tournament_id: int):
        return await self.task_repository.get_tasks_by_tournment(tournament_id)

    async def delete_task(self, task_id: int):
        task = await self.task_repository.get_task(task_id)
        
        if task is None:
            return False
        
        return await self.task_repository.delete_task(task_id)

    async def delete_all_tasks_by_tournament(self, tournament_id: int):
        return await self.task_repository.delete_tasks_by_tournament(tournament_id)

