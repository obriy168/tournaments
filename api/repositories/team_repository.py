from typing import Annotated

from fastapi import Depends
from sqlalchemy import select, func, distinct
from sqlalchemy.orm import joinedload, selectinload
from sqlalchemy.ext.asyncio.session import AsyncSession

from database.schemas.schema import Team, Submission, TaskAssignment, Evaluation
from repositories.base_repository import BaseRepository
from util.database import get_db

class TeamRepository(BaseRepository[Team]):
    def __init__(self, db: Annotated[AsyncSession, Depends(get_db)]):
        super().__init__(model=Team, db=db)
    
    async def get_teams_by_tournament_id(self, tournament_id: int):
        query = select(Team).where(Team.tournament_id == tournament_id)
    
        teams = await self.db.execute(query)
        return teams.scalars().all()
    
    async def save_team_with_users(self, entity: Team) -> Team:
        self.db.add(entity)
        await self.db.commit()
    
        query = select(Team).options(selectinload(Team.user_teams)).where(Team.id == entity.id)
        result = await self.db.execute(query)
        return result.scalars().first()
    
    
    async def get_leaderboard_by_tournament_id(self, tournament_id: int, limit: int | None, offset: int | None):
        count_query = (
            select(func.count())
            .select_from(Team)
            .where(Team.tournament_id == tournament_id))

        query = (select(
                        Team.id,
                        Team.name,
                        Team.city,
                        Team.organization,
                        func.coalesce(func.sum(Evaluation.scores), 0).label("total_score"),
                        func.count(distinct(Submission.id)).label("sub_count"))
                      .outerjoin(Team.submissions)
                      .outerjoin(Submission.assignments)
                      .outerjoin(TaskAssignment.evaluations)
                      .where(Team.tournament_id == tournament_id)
                      .group_by(Team.id, Team.name, Team.city, Team.organization)
                      .order_by(func.coalesce(func.sum(Evaluation.scores), 0).desc()))
        
        if limit is not None:
            query = query.limit(limit)
        if offset is not None:
            query = query.offset(offset)

        result = await self.db.execute(query)
        leaderboard = result.mappings().all()

        total = (await self.db.execute(count_query)).scalar_one()

        return leaderboard, total