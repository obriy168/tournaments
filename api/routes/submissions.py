from fastapi import APIRouter, Depends, HTTPException
from services.submission_service import SubmissionService 
from services.tournaments_service import TournamentsService
from typing import Annotated
from services.models.submission_model import SubmissionModel
from enums.role_enum import RoleEnum
from util.role_required import RoleRequired
from util.auth import validate_session
from routes.models.user_session import UserSession

submissions_router = APIRouter(prefix="/submissions", tags=["submissions"])

@submissions_router.get("/{submission_id}")
async def get_submission_by_id(submission_id: int, submission_service: Annotated[SubmissionService, Depends(SubmissionService)],
                               user_session: Annotated[UserSession, Depends(validate_session)]):
    submission = await submission_service.get_submission_by_id_custom(submission_id)
    if submission is None:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    if user_session.is_admin:
        return submission
    
    is_member = await submission_service.check_user_in_team(user_session.user_id, submission.team_id)

    is_staff = any(role.tournament_id == submission.task.tournament_id and role.role in [RoleEnum.JURY, RoleEnum.ORGANIZER]for role in user_session.roles)

    if not is_member and not is_staff:
        raise HTTPException(
            status_code=403, 
            detail="Access denied: You are not a member of this team or a staff member of this tournament"
        )

    return submission

@submissions_router.get("/task/{task_id}")
async def get_submissions_by_task_id(task_id: int, submission_service: Annotated[SubmissionService, Depends(SubmissionService)],
                                     user_session: Annotated[UserSession, Depends(RoleRequired([RoleEnum.ADMIN, RoleEnum.ORGANIZER, RoleEnum.JURY]))]):
    return await submission_service.get_submissions_by_task_id(task_id)

@submissions_router.post("/")
async def create_submission(submission: SubmissionModel, submission_service: Annotated[SubmissionService, Depends(SubmissionService)],
                            user_session: Annotated[UserSession, Depends(RoleRequired([RoleEnum.PARTICIPANT]))]):
    is_member = await submission_service.check_user_in_team(user_session.user_id, submission.team_id)
    if not is_member:
        raise HTTPException(status_code=403, detail="You are not a member of this team")
    return await submission_service.create_submission(submission)

@submissions_router.put("/{submission_id}")
async def update_submission(submission_id: int, submission: SubmissionModel, submission_service: Annotated[SubmissionService, Depends(SubmissionService)],
                            user_session: Annotated[UserSession, Depends(validate_session)]):
    db_submission = await submission_service.get_submission_by_id(submission_id)
    if not db_submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    if not user_session.is_admin:
        is_member = await submission_service.check_user_in_team(user_session.user_id, db_submission.team_id)
        if not is_member:
            raise HTTPException(status_code=403, detail="Only team members can update this submission")

    return await submission_service.update_submission(submission_id, submission)

@submissions_router.delete("/{submission_id}")
async def delete_submissions(submission_id: int, submission_service: Annotated[SubmissionService, Depends(SubmissionService)],
                             user_session: Annotated[UserSession, Depends(RoleRequired([RoleEnum.ADMIN, RoleEnum.ORGANIZER]))]):
    is_deleted = await submission_service.delete_submission(submission_id)
    if not is_deleted:
        raise HTTPException(status_code=404, detail="Submission not found")
    return {"detail": "Submission deleted successfully"}