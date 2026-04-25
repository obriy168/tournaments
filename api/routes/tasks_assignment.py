from fastapi import APIRouter, Query
from services.task_assigment_service import TaskAssignmentService
from fastapi import Depends, HTTPException
from typing import Annotated
from services.models.task_assigment_model import TaskAssigmentModel

task_assignment_router = APIRouter(prefix="/task_assignment", tags=["task_assignment"])

@task_assignment_router.get("/{task_assignment_id}")
async def get_task_assignment_by_id(task_assignment_id: int, task_assignment_service: Annotated[TaskAssignmentService, Depends(TaskAssignmentService)]):
    task_assignment = await task_assignment_service.get_task_assignment_by_id(task_assignment_id)
    if task_assignment is None:
        raise HTTPException(status_code=404, detail="Task assignment not found")
    return task_assignment

@task_assignment_router.get("/{jury_member_id}")
async def get_task_assignment_by_jury_member_id(jury_member_id: int, task_assignment_service: Annotated[TaskAssignmentService, Depends(TaskAssignmentService)]):
    return await task_assignment_service.get_tasks_assignment_by_jury_member_id(jury_member_id)

@task_assignment_router.post("/")
async def create_task_assignment(task_assignment: TaskAssigmentModel, task_assignment_service: Annotated[TaskAssignmentService, Depends(TaskAssignmentService)]):
    return await task_assignment_service.create_task_assignment(task_assignment)

@task_assignment_router.delete("/{task_assignment_id}")
async def create_task_assignment(task_assignment_id: int, task_assignment_service: Annotated[TaskAssignmentService, Depends(TaskAssignmentService)]):
    is_deleted = await task_assignment_service.delete_task_assignment(task_assignment_id)
    if not is_deleted:
        raise HTTPException(status_code=404, detail="Task assignment not found")
    return {"detail": "Task assignment deleted successfully"}