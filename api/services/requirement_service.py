from repositories.requirement_repository import RequirementRepository
from database.schemas.schema import Requirement
from services.models.requirement_model import RequirementModel
from typing import Annotated
from fastapi import Depends

class RequirementService:
    def __init__(self, requirement_repository: Annotated[RequirementRepository, Depends(RequirementRepository)]):
        self.requirement_repository = requirement_repository



