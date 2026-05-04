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
    
    async def get_tasks_assignment_by_evaluator_id(self, evaluator_id: int):
        return await self.task_assigment_repository.get_tasks_assignment_by_evaluator_id(evaluator_id)
    
    async def create_task_assignment(self, task_assigment: TaskAssigmentModel) -> TaskAssignment:
        data = task_assigment.model_dump(exclude={"id"})
        task_assigment_entity = TaskAssignment(**data)
        return await self.task_assigment_repository.save(task_assigment_entity)

    async def auto_assign_tasks(self, jury_to_evaluate: int):
        pass

    async def update_task_assignment_is_completed(self, task_assignment_id: int, status: bool = True):
        task_assignment = await self.task_assigment_repository.get_by_id(task_assignment_id)
        if not task_assignment:
            return None
        
        if task_assignment.is_completed == status:
            return None
        
        task_assignment.is_completed = status

        return await self.task_assigment_repository.save(task_assignment)

    async def delete_task_assignment(self, task_assignment_id: int) -> bool:
        return await self.task_assigment_repository.delete(task_assignment_id)