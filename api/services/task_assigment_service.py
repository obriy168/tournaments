from repositories.task_assigment_repository import TaskAssignmentRepository
from database.schemas.schema import TaskAssignment
from services.models.task_assigment_model import TaskAssigmentModel
from typing import Annotated
from fastapi import Depends

class TaskAssignmentService:
    def __init__(self, task_assigment_repository: Annotated[TaskAssignmentRepository, Depends(TaskAssignmentRepository)]):
        self.task_assigment_repository = task_assigment_repository

    async def get_task_assignment_by_id(self, task_assignment_id: int):
        return await self.task_assigment_repository.get_by_id(task_assignment_id)
    
    async def get_tasks_assignment_by_jury_member_id(self, jury_member_id: int):
        return await self.task_assigment_repository.get_tasks_assignment_by_jury_member_id(jury_member_id)
    
    async def create_task_assignment(self, task_assigment: TaskAssigmentModel) -> TaskAssignment:
        data = task_assigment.model_dump(exclude={"id"})
        task_assigment_entity = TaskAssignment(**data)
        return await self.task_assigment_repository.save(task_assigment_entity)

    async def delete_task_assignment(self, task_assignment_id: int) -> bool:
        return await self.task_assigment_repository.delete(task_assignment_id)