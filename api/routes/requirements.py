from fastapi import APIRouter, Query
from services.requirement_service import RequirementService
from fastapi import Depends, HTTPException
from typing import Annotated
from services.models.requirement_model import RequirementModel

requirement_router = APIRouter(prefix="/requirements", tags=["requirements"])

@requirement_router.get("/{requirement_id}")
async def get_requirements_by_task_id(requirement_id: int, requirements_service: Annotated[RequirementService, Depends(RequirementService)]):
    requirement = await requirements_service.get_requirement_by_id(requirement_id)
    if requirement is None:
        raise HTTPException(status_code=404, detail="Requirement not found")
    return requirement

@requirement_router.get("/task/{task_id}")
async def get_requirements_by_task_id(task_id: int, requirements_service: Annotated[RequirementService, Depends(RequirementService)]):
    requirements = await requirements_service.get_requirements_by_task_id(task_id)
    return requirements

@requirement_router.post("/")
async def create_requirement(requirement: RequirementModel, requirements_service: Annotated[RequirementService, Depends(RequirementService)]):
    return await requirements_service.create_requirement(requirement)

@requirement_router.delete("/")
async def delete_requirements(ids: Annotated[list[int], Query], requirements_service: Annotated[RequirementService, Depends(RequirementService)]):
    is_delete = await requirements_service.delete_requirements(ids)
    return is_delete