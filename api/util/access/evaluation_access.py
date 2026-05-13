from fastapi import Depends

from util.auth import validate_session
from routes.models.user_session import UserSession

from services.evaluation_service import EvaluationService
from services.task_assigment_service import TaskAssignmentService

from util.access.helpers import (
    forbidden,
    not_found
)

class EvaluationAccess:
    @staticmethod
    async def can_modify_evaluation(evaluation_id: int,
                                  user: UserSession = Depends(validate_session),
                                  evaluation_service: EvaluationService = Depends(EvaluationService)):
        if user.is_admin: return user

        is_owner = await evaluation_service.check_evaluation_ownership(evaluation_id, user.user_id)
        if not is_owner:
            forbidden("You can only edit your own evaluations")
        return user

    @staticmethod
    async def as_jury_of_tournament(task_assignment_id: int,
                                    user: UserSession = Depends(validate_session),
                                    assignment_service: TaskAssignmentService = Depends(TaskAssignmentService)):
        if user.is_admin: return user

        task_assignment = await assignment_service.get_task_assignment_by_id(task_assignment_id)
        if not task_assignment:
            not_found("Task assignment not found")

        if task_assignment.evaluator_id != user.user_id:
            forbidden("You are not a jury member in this tournament")
        
        return user