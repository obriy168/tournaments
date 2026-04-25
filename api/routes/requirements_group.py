from fastapi import APIRouter
from services.requirement_group_service import RequirementGroupService
from fastapi import Depends, HTTPException
from typing import Annotated
from services.models.requirement_group_model import RequirementGroupModel

requirement_group_router = APIRouter(prefix="/requirement_groups", tags=["requirement_groups"])

@requirement_group_router.post("/")
async def create_requirement_group(requirement_group: RequirementGroupModel, requirements_group_service: Annotated[RequirementGroupService, Depends(RequirementGroupService)]):
    return await requirements_group_service.create_requirement_group(requirement_group)

@requirement_group_router.get("/{task_id}")
async def get_requirement_groups_by_task_id(task_id: int, requirements_group_service: Annotated[RequirementGroupService, Depends(RequirementGroupService)]):
    return await requirements_group_service.get_requirement_groups_by_task_id(task_id)

@requirement_group_router.delete("/{requirement_group_id}")
async def delete_requirement_group(requirement_group_id: int, requirements_group_service: Annotated[RequirementGroupService, Depends(RequirementGroupService)]):
    return await requirements_group_service.delete_requirement_group(requirement_group_id)