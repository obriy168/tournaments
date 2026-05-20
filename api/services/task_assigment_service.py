from typing import Annotated

from fastapi import Depends
from random import shuffle

from database.schemas.schema import TaskAssignment
from repositories.submission_repository import SubmissionRepository
from repositories.task_assigment_repository import TaskAssignmentRepository
from repositories.task_repository import TaskRepository
from repositories.user_role_repository import UserRoleRepository
from services.models.task_assigment_model import TaskAssigmentModel

class TaskAssignmentService:
    def __init__(self, task_assigment_repository: Annotated[TaskAssignmentRepository, Depends(TaskAssignmentRepository)],
                       user_role_repository: Annotated[UserRoleRepository, Depends(UserRoleRepository)],
                       submission_repository: Annotated[SubmissionRepository, Depends(SubmissionRepository)],
                       task_repository: Annotated[TaskRepository, Depends(TaskRepository)]):
        self.task_assigment_repository = task_assigment_repository
        self.user_role_repository = user_role_repository
        self.submission_repository = submission_repository
        self.task_repository = task_repository

    async def get_task_assignment_by_id(self, task_assignment_id: int):
        return await self.task_assigment_repository.get_by_id(task_assignment_id)
    
    async def get_tasks_assignment_by_evaluator_id(self, evaluator_id: int):
        return await self.task_assigment_repository.get_tasks_assignment_by_evaluator_id(evaluator_id)
    
    async def create_task_assignment(self, task_assigment: TaskAssigmentModel) -> TaskAssignment:
        data = task_assigment.model_dump(exclude={"id"})
        task_assigment_entity = TaskAssignment(**data)
        return await self.task_assigment_repository.save(task_assigment_entity)

    async def auto_assign_tasks(self, task_id: int, min_jury_to_evaluate: int) -> list[TaskAssignment] | dict:
        await self.task_assigment_repository.delete_assignments_by_task_id(task_id)
        task = await self.task_repository.get_by_id(task_id)
        if not task:
            return {"detail": "Task not found"} 

        submissions = await self.submission_repository.get_submissions_by_task_id(task_id)
        jurys = await self.user_role_repository.get_users_by_role_name("Jury", task.tournament_id)
        if len(jurys) < min_jury_to_evaluate:
            return {"detail": "Not enough jurys to evaluate the task"}
        
        shuffle(submissions)

        task_assignments: list[TaskAssignment] = []

        jury_index = 0
        for submission in submissions:
            for _ in range(min_jury_to_evaluate):
                task_assignment = TaskAssignment(evaluator_id=jurys[jury_index].user_id, submission_id=submission.id, is_completed=False)
                task_assignments.append(task_assignment)
                jury_index = (jury_index + 1) % len(jurys)

        return await self.task_assigment_repository.save_all_tasks(task_assignments)

    async def update_task_assignment_is_completed(self, task_assignment_id: int, status: bool = True):
        task_assignment = await self.task_assigment_repository.get_by_id(task_assignment_id)
        if task_assignment is None:
            return None
        
        if task_assignment.is_completed == status:
            return None
        
        task_assignment.is_completed = status

        return await self.task_assigment_repository.save(task_assignment)

    async def delete_task_assignment(self, task_assignment_id: int) -> bool:
        return await self.task_assigment_repository.delete(task_assignment_id)