from util.database import get_db
from sqlalchemy.ext.asyncio.session import AsyncSession
from database.schemas.schema import JuryMember
from typing import Annotated
from fastapi import Depends
from repositories.base_repository import BaseRepository

class JuryMemberRepository(BaseRepository[JuryMember]):
    def __init__(self, db: Annotated[AsyncSession, Depends(get_db)]):
        super().__init__(model=JuryMember, db=db)