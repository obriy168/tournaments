from util.database import get_db
from sqlalchemy.ext.asyncio.session import AsyncSession
from database.schemas.schema import Tournament
from typing import Annotated
from fastapi import Depends
from repositories.base_repository import BaseRepository

class TournamentRepository(BaseRepository[Tournament]):
    def __init__(self, db: Annotated[AsyncSession, Depends(get_db)]):
        super().__init__(model=Tournament, db=db)

