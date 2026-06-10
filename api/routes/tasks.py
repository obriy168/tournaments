from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from enums.role_enum import RoleEnum
from enums.task_status_enum import TaskStatus
from routes.models.user_session import UserSession
from routes.models.tasks_full_response import TasksDetailedResponse
from services.models.pagination_model import PaginationModel
from services.models.task_model import TaskModel
from services.task_service import TaskService
from util.access.task_access import TaskAccess
from util.access.role_required import RoleRequired
from util.auth import validate_session

task_router = APIRouter(prefix="/tasks", tags=["tasks"])

@task_router.get("/task/{task_id}")
async def get_task_by_id(task_id: int, 
                         tasks_service: Annotated[TaskService, Depends(TaskService)],
                         user_session: Annotated[UserSession, Depends(validate_session)]):
    task = await tasks_service.get_task_by_id(task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@task_router.get("/tournament/{tournament_id}/team/{team_id}", response_model=list[TasksDetailedResponse])
async def get_tasks_with_details(tournament_id: int, team_id: int, 
                                 tasks_service: Annotated[TaskService, Depends(TaskService)],
                                 user_session: Annotated[UserSession, Depends(validate_session)]):
    return await tasks_service.get_tasks_with_details(tournament_id, team_id)

@task_router.get("/search")
async def search_task(tasks_service: Annotated[TaskService, Depends(TaskService)],
                      pagination: Annotated[PaginationModel, Depends()],
                      user_session: Annotated[UserSession, Depends(validate_session)],
                      text: Optional[str] = Query(None), status: Optional[TaskStatus] = Query(None)):
    return await tasks_service.search_task(text=text, status=status, pagination=pagination)

@task_router.get("/pagination")
async def get_all_tasks_pagination(tasks_service: Annotated[TaskService, Depends(TaskService)],
                                   pagination: Annotated[PaginationModel, Depends()],
                                   user_session: Annotated[UserSession, Depends(RoleRequired([RoleEnum.ADMIN]))]):
    return await tasks_service.get_all_tasks_pagination(pagination)

@task_router.post("/")
async def create_task(task: TaskModel, 
                      tasks_service: Annotated[TaskService, Depends(TaskService)],
                      user_session: Annotated[UserSession, Depends(validate_session)]):
    await TaskAccess.as_tournament_organizer(tournament_id=task.tournament_id, user=user_session)

    return await tasks_service.create_task(task)

@task_router.put("/")
async def update_task(task_id: int, task: TaskModel, 
                      tasks_service: Annotated[TaskService, Depends(TaskService)],
                      user_session: Annotated[UserSession, Depends(TaskAccess.as_organizer)]):
    db_task = await tasks_service.get_task_by_id(task_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return await tasks_service.update_task(task_id, task)

@task_router.patch("/{task_id}/status")
async def update_task_status(task_id: int, status: str, 
                             tasks_service: Annotated[TaskService, Depends(TaskService)],
                             user_session: Annotated[UserSession, Depends(TaskAccess.as_organizer)]):
    db_task = await tasks_service.get_task_by_id(task_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    task = await tasks_service.update_task_status(task_id, status)
    if not task:
        raise HTTPException(status_code=400, detail="Status transition not allowed or task not found")
    return task

@task_router.get("/tournament/{tournament_id}")
async def get_tasks_by_tournament(tournament_id: int, 
                                  tasks_service: Annotated[TaskService, Depends(TaskService)],
                                  user_session: Annotated[UserSession, Depends(validate_session)]):
    return await tasks_service.get_tasks_by_tournment(tournament_id)

@task_router.delete("/{task_id}")
async def delete_task(task_id: int, 
                      tasks_service: Annotated[TaskService, Depends(TaskService)],
                      user_session: Annotated[UserSession, Depends(TaskAccess.as_organizer)]):
    db_task = await tasks_service.get_task_by_id(task_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    await tasks_service.delete_task(task_id)
    return {"detail": "Task deleted successfully"}
