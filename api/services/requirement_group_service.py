from typing import Annotated

from fastapi import Depends

from database.schemas.schema import RequirementGroup
from repositories.requirement_group_repository import RequirementGroupRepository
from services.models.requirement_group_model import RequirementGroupModel

class RequirementGroupService:
    def __init__(self, requirement_group_repository: Annotated[RequirementGroupRepository, Depends(RequirementGroupRepository)]):
        self.requirement_group_repository = requirement_group_repository

    async def get_requirement_groups_by_task_id(self, task_id: int):
        return await self.requirement_group_repository.get_requirements_group_by_task(task_id)
    
    async def get_requirement_group_by_id(self, requirement_group_id: int):
        return await self.requirement_group_repository.get_by_id(requirement_group_id)
    
    async def create_requirement_group(self, requirement_group: RequirementGroupModel) -> RequirementGroup:
        data = requirement_group.model_dump(exclude={"id"})
        requirement_group_entity = RequirementGroup(**data)
        return await self.requirement_group_repository.save(requirement_group_entity)

    async def delete_requirement_group(self, requirement_group_id: int):
        return await self.requirement_group_repository.delete(requirement_group_id)

    async def get_tournament_id_by_task_id(self, task_id: int) -> int:
        return await self.requirement_group_repository.get_tournament_id_by_task_id(task_id)
    
    async def get_tournament_id_by_group(self, requirement_group_id: int) -> int:
        requirement_group = await self.requirement_group_repository.get_by_id(requirement_group_id)
        if not requirement_group:
            return None
        return await self.requirement_group_repository.get_tournament_id_by_task_id(requirement_group.task_id)