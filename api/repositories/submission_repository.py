from util.database import get_db
from sqlalchemy.ext.asyncio.session import AsyncSession
from database.schemas.schema import Submission, Team
from typing import Annotated
from fastapi import Depends
from sqlalchemy import select
from repositories.base_repository import BaseRepository

class SubmissionRepository(BaseRepository[Submission]):
    def __init__(self, db: Annotated[AsyncSession, Depends(get_db)]):
        super().__init__(model=Submission, db=db)

    async def get_submissions_by_tournament_id(self, tournament_id: int):
        query = select(Submission).join(Team, Submission.team_id == Team.id).where(Team.tournament_id == tournament_id)
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_submissions_by_task_id(self, task_id: int):
        query = select(Submission).where(Submission.task_id == task_id)
        result = await self.db.execute(query)
        return result.scalars().all()