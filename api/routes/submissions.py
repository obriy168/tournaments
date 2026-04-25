from fastapi import APIRouter, Query
from services.submission_service import SubmissionService 
from fastapi import Depends, HTTPException
from typing import Annotated
from services.models.submission_model import SubmissionModel

submissions_router = APIRouter(prefix="/submissions", tags=["submissions"])

@submissions_router.get("/{submission_id}")
async def get_submission_by_id(submission_id: int, submission_service: Annotated[SubmissionService, Depends(SubmissionService)]):
    submission = await submission_service.get_submission_by_id(submission_id)
    if submission is None:
        raise HTTPException(status_code=404, detail="Submission not found")
    return submission

@submissions_router.get("/{tournament_id}")
async def get_submissions_by_tournament_id(tournament_id: int, submission_service: Annotated[SubmissionService, Depends(SubmissionService)]):
    return await submission_service.get_submissions_by_tournament_id(tournament_id)

@submissions_router.post("/")
async def create_submission(submission: SubmissionModel, submission_service: Annotated[SubmissionService, Depends(SubmissionService)]):
    return await submission_service.create_submission(submission)

@submissions_router.put("/{submission_id}")
async def update_submission(submission_id: int, submission: SubmissionModel, submission_service: Annotated[SubmissionService, Depends(SubmissionService)]):
    submission = await submission_service.update_submission(submission_id, submission)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    return submission

@submissions_router.delete("/{submission_id}")
async def delete_submissions(submission_id: int, submission_service: Annotated[SubmissionService, Depends(SubmissionService)]):
    is_deleted = await submission_service.delete_submission(submission_id)
    if not is_deleted:
        raise HTTPException(status_code=404, detail="Submission not found")
    return {"detail": "Submission deleted successfully"}