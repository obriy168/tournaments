from fastapi import Depends

from util.auth import validate_session
from routes.models.user_session import UserSession

from services.requirement_service import RequirementService
from services.requirement_group_service import RequirementGroupService
from services.task_service import TaskService

from util.access.helpers import (
    is_tournament_organizer,
    forbidden,
    not_found
)

class RequirementAccess:
    @staticmethod
    async def as_organizer(requirement_id: int,
                           user: UserSession = Depends(validate_session),
                           requirement_service: RequirementService = Depends(RequirementService),
                           requirement_group_service: RequirementGroupService = Depends(RequirementGroupService),
                           task_service: TaskService = Depends(TaskService)):
        if user.is_admin: return user

        requirement = await requirement_service.get_requirement_by_id(requirement_id)
        if not requirement:
            not_found("Requirement not found")

        group = await requirement_group_service.get_requirement_group_by_id(requirement.requirement_group_id)
        if not group:
            forbidden("Requirement group not found")

        task = await task_service.get_task_by_id(group.task_id)
        if not task:
            not_found("Task not found")

        if not is_tournament_organizer(user, task.tournament_id):
            forbidden("Forbidden")

        return user
    
    @staticmethod
    async def as_group_organizer(requirement_group_id: int,
                                 user: UserSession = Depends(validate_session),
                                 requirement_group_service: RequirementGroupService = Depends(RequirementGroupService),
                                 task_service: TaskService = Depends(TaskService)):
        if user.is_admin: return user

        group = await requirement_group_service.get_requirement_group_by_id(requirement_group_id)
        if not group:
            not_found("Requirement group not found")

        task = await task_service.get_task_by_id(group.task_id)
        if not task:
            not_found("Task not found")

        if not is_tournament_organizer(user, task.tournament_id):
            forbidden("You are not an organizer")
        
        return user