from fastapi import APIRouter, Depends, HTTPException
from services.task_service import TaskService
from services.task_assigment_service import TaskAssignmentService
from services.tournaments_service import TournamentsService
from services.submission_service import SubmissionService
from services.models.task_assigment_model import TaskAssigmentModel
from typing import Annotated
from enums.role_enum import RoleEnum
from util.role_required import RoleRequired
from util.auth import validate_session
from routes.models.user_session import UserSession

task_assignment_router = APIRouter(prefix="/task_assignment", tags=["task_assignment"])

@task_assignment_router.get("/{task_assignment_id}")
async def get_task_assignment_by_id(task_assignment_id: int, task_assignment_service: Annotated[TaskAssignmentService, Depends(TaskAssignmentService)], 
                                    submission_service: Annotated[SubmissionService, Depends(SubmissionService)],
                                    user_session: Annotated[UserSession, Depends(validate_session)]):
    assignment = await task_assignment_service.get_task_assignment_by_id(task_assignment_id)
    if assignment is None:
        raise HTTPException(status_code=404, detail="Task assignment not found")
    
    if user_session.is_admin:
        return assignment
    is_own_assignment = (user_session.user_id == assignment.evaluator_id)
    
    submission = await submission_service.get_submission_by_id_custom(assignment.submission_id)
    is_organizer = any(
        role.tournament_id == submission.task.tournament_id and role.role == RoleEnum.ORGANIZER 
        for role in user_session.roles
    )
    
    if not is_own_assignment and not is_organizer:
        raise HTTPException(status_code=403, detail="Access rejected")
            
    return assignment

@task_assignment_router.get("/evaluator/{evaluator_id}")
async def get_task_assignment_by_evaluator_id(evaluator_id: int, task_assignment_service: Annotated[TaskAssignmentService, Depends(TaskAssignmentService)],
                                              user_session: Annotated[UserSession, Depends(validate_session)]):
    is_target_evaluator = (user_session.user_id == evaluator_id)
    if not user_session.is_admin and not is_target_evaluator:
         raise HTTPException(status_code=403, detail="Cannot view other evaluator's tasks")
    return await task_assignment_service.get_tasks_assignment_by_evaluator_id(evaluator_id)

@task_assignment_router.post("/")
async def create_task_assignment(task_assignment: TaskAssigmentModel, task_assignment_service: Annotated[TaskAssignmentService, Depends(TaskAssignmentService)],
                                 submission_service: Annotated[SubmissionService, Depends(SubmissionService)],
                                 tournaments_service: Annotated[TournamentsService, Depends(TournamentsService)],
                                 user_session: Annotated[UserSession, Depends(validate_session)]):
    if user_session.is_admin:
        return await task_assignment_service.create_task_assignment(task_assignment)

    submission = await submission_service.get_submission_by_id_custom(task_assignment.submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    tournament_id = submission.task.tournament_id
    is_organizer = any(
        role.tournament_id == tournament_id and role.role == RoleEnum.ORGANIZER 
        for role in user_session.roles
    )

    if not is_organizer:
        raise HTTPException(status_code=403, detail="Only organizers of this tournament can assign tasks")

    return await task_assignment_service.create_task_assignment(task_assignment)

@task_assignment_router.post("/auto-assign/{task_id}/{min_jury_to_evaluate}")
async def auto_assign_tasks(task_id: int, min_jury_to_evaluate: int, task_assignment_service: Annotated[TaskAssignmentService, Depends(TaskAssignmentService)],
                            task_service: Annotated[TaskService, Depends(TaskService)],
                            user_session: Annotated[UserSession, Depends(validate_session)]):
    if not user_session.is_admin:
        task = await task_service.get_task_by_id(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        is_organizer = any(
            role.tournament_id == task.tournament_id and role.role == RoleEnum.ORGANIZER 
            for role in user_session.roles
        )
        if not is_organizer:
            raise HTTPException(status_code=403, detail="Only organizers of this specific tournament can auto-assign")

    task_assignments = await task_assignment_service.auto_assign_tasks(task_id, min_jury_to_evaluate)
    if task_assignments is None:
        raise HTTPException(status_code=400, detail="Assignment failed")
    return task_assignments

@task_assignment_router.patch("/{task_assignment_id}/status")
async def update_task_assignment_is_completed(task_assignment_id: int, task_assignment_service: Annotated[TaskAssignmentService, Depends(TaskAssignmentService)],
                                              user_session: Annotated[UserSession, Depends(validate_session)],
                                              status: bool = True):
    assignment = await task_assignment_service.get_task_assignment_by_id(task_assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Task assignment not found")

    is_assigned = (user_session.user_id == assignment.evaluator_id)
    if not user_session.is_admin and not is_assigned:
        raise HTTPException(status_code=403, detail="You are not assigned to this task")

    result = await task_assignment_service.update_task_assignment_is_completed(task_assignment_id, status)
    if result is None:
        raise HTTPException(status_code=400, detail="Update failed")
    return result

@task_assignment_router.delete("/{task_assignment_id}")
async def delete_task_assignment(task_assignment_id: int, task_assignment_service: Annotated[TaskAssignmentService, Depends(TaskAssignmentService)],
                                 submission_service: Annotated[SubmissionService, Depends(SubmissionService)],
                                 user_session: Annotated[UserSession, Depends(validate_session)]):
    assignment = await task_assignment_service.get_task_assignment_by_id(task_assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Task assignment not found")

    if not user_session.is_admin:
        submission = await submission_service.get_submission_by_id_custom(assignment.submission_id)
        is_organizer = any(
            role.tournament_id == submission.task.tournament_id and role.role == RoleEnum.ORGANIZER 
            for role in user_session.roles
        )
        if not is_organizer:
            raise HTTPException(status_code=403, detail="Only organizers can delete their tournament's assignments")

    is_deleted = await task_assignment_service.delete_task_assignment(task_assignment_id)
    if not is_deleted:
        raise HTTPException(status_code=404, detail="Task assignment not found")
    return {"detail": "Task assignment deleted successfully"}