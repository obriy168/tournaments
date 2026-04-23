from repositories.requirement_group_repository import RequirementGroupRepository
from database.schemas.schema import RequirementGroup
from services.models.requirement_group_model import RequirementGroupModel
from typing import Annotated
from fastapi import Depends

class RequirementGroupService:
    def __init__(self, requirement_group_repository: Annotated[RequirementGroupRepository, Depends(RequirementGroupRepository)]):
        self.requirement_group_repository = requirement_group_repository



