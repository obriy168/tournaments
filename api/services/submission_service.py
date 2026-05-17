from repositories.submission_repository import SubmissionRepository
from database.schemas.schema import Submission
from services.models.submission_model import SubmissionModel
from services.models.pagination_model import PaginationModel
from typing import Annotated
from fastapi import Depends
import math

class SubmissionService:
    def __init__(self, submission_repository: Annotated[SubmissionRepository, Depends(SubmissionRepository)]):
        self.submission_repository = submission_repository

    async def get_submission_by_id_custom(self, submission_id: int):
        return await self.submission_repository.get_submission_by_id(submission_id)
    
    async def get_submissions_by_task_id(self, task_id: int):
        return await self.submission_repository.get_submissions_by_task_id(task_id)
    
    async def get_submission_by_id(self, submission_id: int):
        return await self.submission_repository.get_by_id(submission_id)
    
    async def get_all_submissions(self):
        return await self.submission_repository.get_all()
    
    async def get_all_submissions_paginated(self, pagination: PaginationModel):
        submissions, total_count = await self.submission_repository.get_all_paginated(limit=pagination.limit, offset=pagination.offset)
        
        return {
            "items": submissions,
            "meta": {
                "page": pagination.page,
                "page_size": pagination.limit,
                "total": total_count,
                "pages": math.ceil(total_count / pagination.limit)
            }
        }
    
    async def create_submission(self, submission: SubmissionModel) -> Submission:
        data = submission.model_dump(exclude={"id"})
        submission_entity = Submission(**data)
        return await self.submission_repository.save(submission_entity)

    async def update_submission(self, submission_id: int, submission: SubmissionModel) -> Submission:
        db_submission = await self.submission_repository.get_by_id(submission_id)

        if not db_submission:
            return None
        
        new_submission = submission.model_dump(exclude_unset=True, exclude={"id"})
        db_submission.sqlmodel_update(new_submission)

        return await self.submission_repository.save(db_submission)
    
    async def delete_submission(self, submission_id: int) -> bool:
        return await self.submission_repository.delete(submission_id)
    
    async def check_user_in_team(self, user_id: int, team_id: int) -> bool:
        return await self.submission_repository.check_user_in_team(user_id, team_id)
    
    async def get_tournament_id_by_team(self, team_id: int):
        return await self.submission_repository.get_tournament_id_by_team(team_id)