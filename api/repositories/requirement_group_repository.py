from util.database import get_db
from sqlalchemy.ext.asyncio.session import AsyncSession
from database.schemas.schema import RequirementGroup
from typing import Annotated
from fastapi import Depends
from sqlalchemy import select, delete

class RequirementGroupRepository:
    def __init__(self, db: Annotated[AsyncSession, Depends(get_db)]):
        self.db = db
