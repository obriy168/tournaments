from fastapi import APIRouter, Depends, HTTPException
from services.task_service import TaskService
from typing import Annotated
from services.models.task_model import TaskModel

task_router = APIRouter(prefix="/tasks", tags=["tasks"])

@task_router.get("/{task_id}")
async def get_task_by_id(task_id: int, tasks_service: Annotated[TaskService, Depends(TaskService)]):
    task = await tasks_service.get_task_by_id(task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@task_router.post("/")
async def create_task(task: TaskModel, tasks_service: Annotated[TaskService, Depends(TaskService)]):
    return await tasks_service.create_task(task)

@task_router.put("/")
async def update_task(task_id: int, task: TaskModel, tasks_service: Annotated[TaskService, Depends(TaskService)]):
    task = await tasks_service.update_task(task_id, task)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@task_router.patch("/{task_id}/status")
async def update_task_status(task_id: int, status: str, tasks_service: Annotated[TaskService, Depends(TaskService)]):
    task = await tasks_service.update_task_status(task_id, status)
    if not task:
        raise HTTPException(status_code=400, detail="Status transition not allowed or task not found")
    return task

@task_router.get("/tournament/{tournament_id}")
async def get_tasks_by_tournament(tournament_id: int, tasks_service: Annotated[TaskService, Depends(TaskService)]):
    return await tasks_service.get_tasks_by_tournment(tournament_id)

@task_router.delete("/{task_id}")
async def delete_task(task_id: int, tasks_service: Annotated[TaskService, Depends(TaskService)]):
    is_deleted = await tasks_service.delete_task(task_id)
    if not is_deleted:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"detail": "Task deleted successfully"}
