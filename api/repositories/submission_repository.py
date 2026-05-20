from typing import Annotated

from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio.session import AsyncSession
from sqlalchemy.orm import selectinload, joinedload

from database.schemas.schema import Submission, Team, UserTeam, TaskAssignment
from repositories.base_repository import BaseRepository
from util.database import get_db

class SubmissionRepository(BaseRepository[Submission]):
    def __init__(self, db: Annotated[AsyncSession, Depends(get_db)]):
        super().__init__(model=Submission, db=db)

    async def get_submissions_by_tournament_id(self, tournament_id: int):
        query = select(Submission).join(Team, Submission.team_id == Team.id).where(Team.tournament_id == tournament_id)
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_submission_by_id(self,submission_id: int):
        query = select(Submission).options(selectinload(Submission.task)).where(Submission.id == submission_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    async def get_submissions_by_task_id(self, task_id: int):
        query = select(Submission).where(Submission.task_id == task_id)
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def check_user_in_team(self, user_id: int, team_id: int) -> bool:
        query = select(UserTeam).where(UserTeam.user_id == user_id, UserTeam.team_id == team_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none() is not None
    
    async def get_submission_by_id_with_details(self, submission_id):
        query = (select(Submission)
                                            .options(joinedload(Submission.task), 
                                                     joinedload(Submission.team), 
                                                     selectinload(Submission.assignments)
                                                       .selectinload(TaskAssignment.evaluations))
                                            .where(Submission.id == submission_id))

        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    async def get_all_submissions_paginated_with_details(self, limit: int, offset: int):
        query = (select(Submission)
                                            .options(joinedload(Submission.task), 
                                                     joinedload(Submission.team), 
                                                     selectinload(Submission.assignments)
                                                       .selectinload(TaskAssignment.evaluations))
                                            .limit(limit)
                                            .offset(offset))
                                                       
        result = await self.db.execute(query)
        return result.scalars().all()