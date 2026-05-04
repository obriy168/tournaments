from fastapi import APIRouter, Depends, HTTPException
from services.task_assigment_service import TaskAssignmentService
from typing import Annotated
from services.models.task_assigment_model import TaskAssigmentModel

task_assignment_router = APIRouter(prefix="/task_assignment", tags=["task_assignment"])

@task_assignment_router.get("/{task_assignment_id}")
async def get_task_assignment_by_id(task_assignment_id: int, task_assignment_service: Annotated[TaskAssignmentService, Depends(TaskAssignmentService)]):
    task_assignment = await task_assignment_service.get_task_assignment_by_id(task_assignment_id)
    if task_assignment is None:
        raise HTTPException(status_code=404, detail="Task assignment not found")
    return task_assignment

@task_assignment_router.get("/evaluator/{evaluator_id}")
async def get_task_assignment_by_evaluator_id(evaluator_id: int, task_assignment_service: Annotated[TaskAssignmentService, Depends(TaskAssignmentService)]):
    return await task_assignment_service.get_tasks_assignment_by_evaluator_id(evaluator_id)

@task_assignment_router.post("/")
async def create_task_assignment(task_assignment: TaskAssigmentModel, task_assignment_service: Annotated[TaskAssignmentService, Depends(TaskAssignmentService)]):
    return await task_assignment_service.create_task_assignment(task_assignment)

@task_assignment_router.post("/auto-assign/{task_id}/{min_jury_to_evaluate}")
async def auto_assign_tasks(task_id: int, min_jury_to_evaluate: int, task_assignment_service: Annotated[TaskAssignmentService, Depends(TaskAssignmentService)]):
    task_assignments = await task_assignment_service.auto_assign_tasks(task_id, min_jury_to_evaluate)
    if task_assignments is None:
        raise HTTPException(status_code=400, detail=task_assignments["detail"])
    return task_assignments

@task_assignment_router.patch("/{task_assignment_id}/status")
async def update_task_assignment_is_completed(task_assignment_id: int, task_assignment_service: Annotated[TaskAssignmentService, Depends(TaskAssignmentService)], status: bool = True):
    task_assignment = await task_assignment_service.update_task_assignment_is_completed(task_assignment_id, status)
    if task_assignment is None:
        raise HTTPException(status_code=400, detail="Task assignment already completed or task assignment not found")
    return task_assignment

@task_assignment_router.delete("/{task_assignment_id}")
async def delete_task_assignment(task_assignment_id: int, task_assignment_service: Annotated[TaskAssignmentService, Depends(TaskAssignmentService)]):
    is_deleted = await task_assignment_service.delete_task_assignment(task_assignment_id)
    if not is_deleted:
        raise HTTPException(status_code=404, detail="Task assignment not found")
    return {"detail": "Task assignment deleted successfully"}