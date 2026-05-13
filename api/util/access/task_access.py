from fastapi import Depends

from util.auth import validate_session
from routes.models.user_session import UserSession

from services.task_service import TaskService

from util.access.helpers import (
    is_tournament_organizer,
    forbidden,
    not_found
)

class TaskAccess:
    @staticmethod
    async def as_organizer(task_id: int,
                           user: UserSession = Depends(validate_session),
                           task_service: TaskService = Depends(TaskService)):
        if user.is_admin: return user

        task = await task_service.get_task_by_id(task_id)
        if not task:
            raise not_found("Task not found")
        
        if not is_tournament_organizer(user, task.tournament_id):
            raise forbidden("Forbidden: Only tournament organizers can manage this task.")
        return user
    
    @staticmethod
    async def as_tournament_organizer(tournament_id: int,
                                      user: UserSession = Depends(validate_session)):
        if user.is_admin: return user
        
        if not is_tournament_organizer(user, tournament_id):
            raise forbidden("Forbidden: You are not an organizer of this tournament")
        return user