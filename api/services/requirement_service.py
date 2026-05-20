from typing import Annotated

from fastapi import Depends

from database.schemas.schema import Requirement
from repositories.requirement_repository import RequirementRepository
from services.models.requirement_model import RequirementModel

class RequirementService:
    def __init__(self, requirement_repository: Annotated[RequirementRepository, Depends(RequirementRepository)]):
        self.requirement_repository = requirement_repository
    async def get_requirement_by_id(self, requirement_id: int):
        return await self.requirement_repository.get_by_id(requirement_id)
    
    async def get_requirements_by_task_id(self, task_id):
        requirements = await self.requirement_repository.get_requirements_by_task_id(task_id)
        return requirements

    async def create_requirement(self, requirement: RequirementModel):
        data = requirement.model_dump(exclude={"id"})
        requirement_entity = Requirement(**data)
        return await self.requirement_repository.save(requirement_entity)

    async def delete_requirements(self, ids: list[int]) -> bool:
        return await self.requirement_repository.delete_requirements(ids)
    
    async def get_tournament_id_by_group_id(self, requirement_group_id: int) -> int:
        return await self.requirement_repository.get_tournament_id_by_group_id(requirement_group_id)
    
    async def get_tournament_id_by_requirement_id(self, requirement_id: int):
        return await self.requirement_repository.get_tournament_id_by_requirement_id(requirement_id)