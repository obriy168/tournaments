from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from enums.role_enum import RoleEnum
from routes.models.pagination_response import PaginatedResponse
from routes.models.submission_full_response import SubmissionDetailedResponse
from routes.models.user_session import UserSession
from services.models.pagination_model import PaginationModel
from services.models.submission_model import SubmissionModel
from services.submission_service import SubmissionService
from util.access.role_required import RoleRequired
from util.access.submission_access import SubmissionAccess
from util.auth import validate_session

submissions_router = APIRouter(prefix="/submissions", tags=["submissions"])

@submissions_router.get("/submission/{submission_id}")
async def get_submission_by_id(submission_id: int, submission_service: Annotated[SubmissionService, Depends(SubmissionService)],
                               user_session: Annotated[UserSession, Depends(SubmissionAccess.can_view_submission)]):
    return await submission_service.get_submission_by_id_custom(submission_id)

@submissions_router.get("/submission/details/{submission_id}", response_model=SubmissionDetailedResponse)
async def get_submission_by_id_with_details(submission_id: int, submission_service: Annotated[SubmissionService, Depends(SubmissionService)],
                               user_session: Annotated[UserSession, Depends(SubmissionAccess.can_view_submission)]):
    return await submission_service.get_submission_by_id_with_details(submission_id)

@submissions_router.get("/task/{task_id}")
async def get_submissions_by_task_id(task_id: int, submission_service: Annotated[SubmissionService, Depends(SubmissionService)],
                                     user_session: Annotated[UserSession, Depends(validate_session)]):
    return await submission_service.get_submissions_by_task_id(task_id)

@submissions_router.get("/")
async def get_all_submissions(submission_service: Annotated[SubmissionService, Depends(SubmissionService)],
                              user_session: Annotated[UserSession, Depends(RoleRequired([RoleEnum.ADMIN, RoleEnum.ORGANIZER, RoleEnum.JURY]))]):
    return await submission_service.get_all_submissions()

@submissions_router.get("/paginated")
async def get_all_submissions_paginated(submission_service: Annotated[SubmissionService, Depends(SubmissionService)],
                                        pagination: Annotated[PaginationModel, Depends()],
                                        user_session: Annotated[UserSession, Depends(RoleRequired([RoleEnum.ADMIN, RoleEnum.ORGANIZER, RoleEnum.JURY]))]):
    return await submission_service.get_all_submissions_paginated(pagination)

@submissions_router.get("/paginated/details", response_model=PaginatedResponse[SubmissionDetailedResponse])
async def get_all_submissions_paginated_with_details(submission_service: Annotated[SubmissionService, Depends(SubmissionService)],
                                                     pagination: Annotated[PaginationModel, Depends()],
                                                     user_session: Annotated[UserSession, Depends(RoleRequired([RoleEnum.ADMIN, RoleEnum.ORGANIZER, RoleEnum.JURY]))]):
    return await submission_service.get_all_submissions_paginated_with_details(pagination)

@submissions_router.get("/search")
async def search_submissions(submission_service: Annotated[SubmissionService, Depends(SubmissionService)],
                             pagination: Annotated[PaginationModel, Depends()],
                             user_session: Annotated[UserSession, Depends(RoleRequired([RoleEnum.ADMIN, RoleEnum.ORGANIZER, RoleEnum.JURY]))],
                             text: Optional[str] = Query(None)):
    return await submission_service.search_submissions(text, pagination)

@submissions_router.post("/")
async def create_submission(submission: SubmissionModel, submission_service: Annotated[SubmissionService, Depends(SubmissionService)],
                            user_session: Annotated[UserSession, Depends(RoleRequired([RoleEnum.ADMIN]))]):
    is_member = await submission_service.check_user_in_team(user_session.user_id, submission.team_id)
    if not is_member and not user_session.is_admin:
        raise HTTPException(status_code=403, detail="You are not a member of this team")
    return await submission_service.create_submission(submission)

@submissions_router.put("/{submission_id}")
async def update_submission(submission_id: int, submission: SubmissionModel, submission_service: Annotated[SubmissionService, Depends(SubmissionService)],
                            user_session: Annotated[UserSession, Depends(SubmissionAccess.can_modify_submission)]):
    return await submission_service.update_submission(submission_id, submission)

@submissions_router.delete("/{submission_id}")
async def delete_submissions(submission_id: int, submission_service: Annotated[SubmissionService, Depends(SubmissionService)],
                             user_session: Annotated[UserSession, Depends(SubmissionAccess.can_modify_submission)]):
    is_deleted = await submission_service.delete_submission(submission_id)
    if not is_deleted:
        raise HTTPException(status_code=404, detail="Submission not found")
    return {"detail": "Submission deleted successfully"}