from fastapi import APIRouter, Depends, HTTPException
from services.task_assigment_service import TaskAssignmentService
from services.submission_service import SubmissionService
from services.models.task_assigment_model import TaskAssigmentModel
from typing import Annotated
from util.role_required import AssignmentAccess, TaskAccess
from util.auth import validate_session
from routes.models.user_session import UserSession

task_assignment_router = APIRouter(prefix="/task_assignment", tags=["task_assignment"])

@task_assignment_router.get("/{task_assignment_id}")
async def get_task_assignment_by_id(task_assignment_id: int, 
                                    task_assignment_service: Annotated[TaskAssignmentService, Depends(TaskAssignmentService)],
                                    user_session: Annotated[UserSession, Depends(AssignmentAccess.can_view_or_modify)]):            
    return  await task_assignment_service.get_task_assignment_by_id(task_assignment_id)

@task_assignment_router.get("/evaluator/{evaluator_id}")
async def get_task_assignment_by_evaluator_id(evaluator_id: int, 
                                              task_assignment_service: Annotated[TaskAssignmentService, Depends(TaskAssignmentService)],
                                              user_session: Annotated[UserSession, Depends(validate_session)]):
    if not user_session.is_admin and user_session.user_id != evaluator_id:
        raise HTTPException(403, "Cannot view other evaluator's tasks")
    return await task_assignment_service.get_tasks_assignment_by_evaluator_id(evaluator_id)

@task_assignment_router.post("/")
async def create_task_assignment(task_assignment: TaskAssigmentModel, 
                                 task_assignment_service: Annotated[TaskAssignmentService, Depends(TaskAssignmentService)],
                                 submission_service: Annotated[SubmissionService, Depends(SubmissionService)],
                                 user_session: Annotated[UserSession, Depends(validate_session)]):
    submission = await submission_service.get_submission_by_id_custom(task_assignment.submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    await TaskAccess.as_organizer(task_id=submission.task_id, user=user_session)
    return await task_assignment_service.create_task_assignment(task_assignment)

@task_assignment_router.post("/auto-assign/{task_id}/{min_jury_to_evaluate}")
async def auto_assign_tasks(task_id: int, min_jury_to_evaluate: int, 
                            task_assignment_service: Annotated[TaskAssignmentService, Depends(TaskAssignmentService)],
                            user_session: Annotated[UserSession, Depends(TaskAccess.as_organizer)]):
    task_assignments = await task_assignment_service.auto_assign_tasks(task_id, min_jury_to_evaluate)
    if task_assignments is None:
        raise HTTPException(status_code=400, detail="Assignment failed")
    return task_assignments

@task_assignment_router.patch("/{task_assignment_id}/status")
async def update_task_assignment_is_completed(task_assignment_id: int, 
                                              task_assignment_service: Annotated[TaskAssignmentService, Depends(TaskAssignmentService)],
                                              user_session: Annotated[UserSession, Depends(AssignmentAccess.as_evaluator)],
                                              status: bool = True):
    result = await task_assignment_service.update_task_assignment_is_completed(task_assignment_id, status)
    if result is None:
        raise HTTPException(status_code=400, detail="Update failed")
    return result

@task_assignment_router.delete("/{task_assignment_id}")
async def delete_task_assignment(task_assignment_id: int, 
                                 task_assignment_service: Annotated[TaskAssignmentService, Depends(TaskAssignmentService)],
                                 user_session: Annotated[UserSession, Depends(AssignmentAccess.can_view_or_modify)]):
    is_deleted = await task_assignment_service.delete_task_assignment(task_assignment_id)
    if not is_deleted:
        raise HTTPException(status_code=404, detail="Task assignment not found")
    return {"detail": "Task assignment deleted successfully"}