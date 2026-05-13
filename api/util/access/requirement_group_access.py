from fastapi import Depends

from util.auth import validate_session
from routes.models.user_session import UserSession

from services.requirement_group_service import RequirementGroupService
from services.task_service import TaskService

from util.access.helpers import (
    is_tournament_organizer,
    forbidden,
    not_found
)


class RequirementGroupAccess:
    @staticmethod
    async def as_organizer(requirement_group_id: int, 
                           user: UserSession = Depends(validate_session),
                           requirement_group_service: RequirementGroupService = Depends(RequirementGroupService)):
        if user.is_admin: return user

        group = await requirement_group_service.get_requirement_group_by_id(requirement_group_id)
        if not group:
            not_found("Requirement group not found")

        tournament_id = await requirement_group_service.get_tournament_id_by_task_id(group.task_id)

        if not is_tournament_organizer(user, tournament_id):
            forbidden("Forbidden: not organizer of this tournament")

        return user

    @staticmethod
    async def as_task_organizer(task_id: int,
                                user: UserSession = Depends(validate_session),
                                task_service: TaskService = Depends(TaskService)):
        if user.is_admin: return user

        task = await task_service.get_task_by_id(task_id)
        if not task:
            not_found("Task not found")

        if not is_tournament_organizer(user, task.tournament_id):
            forbidden("Forbidden: you are not an organizer of this tournament")
        return user