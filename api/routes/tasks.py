from fastapi import APIRouter, Depends, HTTPException
from services.task_service import TaskService
from services.tournaments_service import TournamentsService
from typing import Annotated
from services.models.task_model import TaskModel
from enums.role_enum import RoleEnum
from util.role_required import RoleRequired
from util.auth import validate_session
from routes.models.user_session import UserSession

task_router = APIRouter(prefix="/tasks", tags=["tasks"])

async def check_tournament_access(tournament_id: int, user_session: UserSession, service: TournamentsService):
    if user_session.is_admin:
        return

    organizers = await service.get_organizers(tournament_id)
    organizer_ids = [org.user_id for org in organizers]

    if user_session.user_id not in organizer_ids:
        raise HTTPException(status_code=403, detail="Forbidden: you are not an organizer of this tournament.")

@task_router.get("/{task_id}")
async def get_task_by_id(task_id: int, tasks_service: Annotated[TaskService, Depends(TaskService)],
                         user_session: Annotated[UserSession, Depends(validate_session)]):
    task = await tasks_service.get_task_by_id(task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@task_router.post("/")
async def create_task(task: TaskModel, tasks_service: Annotated[TaskService, Depends(TaskService)],
                      tournaments_service: Annotated[TournamentsService, Depends(TournamentsService)],
                      user_session: Annotated[UserSession, Depends(RoleRequired([RoleEnum.ADMIN, RoleEnum.ORGANIZER]))]):
    await check_tournament_access(task.tournament_id, user_session, tournaments_service)
    return await tasks_service.create_task(task)

@task_router.put("/{task_id}")
async def update_task(task_id: int, task: TaskModel, tasks_service: Annotated[TaskService, Depends(TaskService)],
                      tournaments_service: Annotated[TournamentsService, Depends(TournamentsService)],
                      user_session: Annotated[UserSession, Depends(RoleRequired([RoleEnum.ADMIN, RoleEnum.ORGANIZER]))]):
    db_task = await tasks_service.get_task_by_id(task_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    await check_tournament_access(db_task.tournament_id, user_session, tournaments_service)
    return await tasks_service.update_task(task_id, task)

@task_router.patch("/{task_id}/status")
async def update_task_status(task_id: int, status: str, tasks_service: Annotated[TaskService, Depends(TaskService)],
                             tournaments_service: Annotated[TournamentsService, Depends(TournamentsService)],
                             user_session: Annotated[UserSession, Depends(RoleRequired([RoleEnum.ADMIN, RoleEnum.ORGANIZER]))]):
    db_task = await tasks_service.get_task_by_id(task_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    await check_tournament_access(db_task.tournament_id, user_session, tournaments_service)

    task = await tasks_service.update_task_status(task_id, status)
    if not task:
        raise HTTPException(status_code=400, detail="Status transition not allowed or task not found")
    return task

@task_router.get("/tournament/{tournament_id}")
async def get_tasks_by_tournament(tournament_id: int, tasks_service: Annotated[TaskService, Depends(TaskService)],
                                  user_session: Annotated[UserSession, Depends(validate_session)]):
    return await tasks_service.get_tasks_by_tournment(tournament_id)

@task_router.delete("/{task_id}")
async def delete_task(task_id: int, tasks_service: Annotated[TaskService, Depends(TaskService)],
                      tournaments_service: Annotated[TournamentsService, Depends(TournamentsService)],
                      user_session: Annotated[UserSession, Depends(RoleRequired([RoleEnum.ADMIN, RoleEnum.ORGANIZER]))]):
    db_task = await tasks_service.get_task_by_id(task_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    await check_tournament_access(db_task.tournament_id, user_session, tournaments_service)

    await tasks_service.delete_task(task_id)
    return {"detail": "Task deleted successfully"}
