from fastapi import Depends

from util.auth import validate_session
from routes.models.user_session import UserSession

from services.task_assigment_service import TaskAssignmentService
from services.submission_service import SubmissionService

from util.access.helpers import (
    is_tournament_organizer,
    forbidden,
    not_found
)

class AssignmentAccess:
    @staticmethod
    async def can_view_or_modify(task_assignment_id: int,
                                 user: UserSession = Depends(validate_session),
                                 task_assignment_service: TaskAssignmentService = Depends(TaskAssignmentService),
                                 submission_service: SubmissionService = Depends(SubmissionService)):
        if user.is_admin: return user

        assignment = await task_assignment_service.get_task_assignment_by_id(task_assignment_id)
        if not assignment:
            not_found("Task assignment not found")

        if assignment.evaluator_id == user.user_id:
            return user

        submission = await submission_service.get_submission_by_id_custom(assignment.submission_id)

        if not is_tournament_organizer(user, submission.task.tournament_id):
            forbidden("Forbidden")
            
        return user

    @staticmethod
    async def as_evaluator(task_assignment_id: int,
                           user: UserSession = Depends(validate_session),
                           task_assignment_service: TaskAssignmentService = Depends(TaskAssignmentService)):
        if user.is_admin: return user
        
        assignment = await task_assignment_service.get_task_assignment_by_id(task_assignment_id)
        if not assignment: 
            not_found("Not found")
            
        if assignment.evaluator_id != user.user_id:
            forbidden("Forbidden: You are not assigned to this task")
        return user


