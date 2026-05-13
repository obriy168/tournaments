from fastapi import APIRouter, Depends, Query, HTTPException
from services.requirement_service import RequirementService
from services.requirement_group_service import RequirementGroupService
from services.task_service import TaskService
from typing import Annotated
from services.models.requirement_model import RequirementModel
from util.role_required import TournamentAccess, RequirementAccess
from util.auth import validate_session
from routes.models.user_session import UserSession

requirement_router = APIRouter(prefix="/requirements", tags=["requirements"])

@requirement_router.get("/{requirement_id}")
async def get_requirements_by_id(requirement_id: int, requirements_service: Annotated[RequirementService, Depends(RequirementService)],
                                      user_session: Annotated[UserSession, Depends(validate_session)]):
    requirement = await requirements_service.get_requirement_by_id(requirement_id)
    if requirement is None:
        raise HTTPException(status_code=404, detail="Requirement not found")
    return requirement

@requirement_router.get("/task/{task_id}")
async def get_requirements_by_task_id(task_id: int, requirements_service: Annotated[RequirementService, Depends(RequirementService)],
                                      user_session: Annotated[UserSession, Depends(validate_session)]):
    requirements = await requirements_service.get_requirements_by_task_id(task_id)
    return requirements

@requirement_router.post("/")
async def create_requirement(requirement: RequirementModel, requirements_service: Annotated[RequirementService, Depends(RequirementService)],
                             requirement_group_service: Annotated[RequirementGroupService, Depends(RequirementGroupService)],
                             task_service: Annotated[TaskService, Depends(TaskService)],
                             user_session: Annotated[UserSession, Depends(validate_session)]):
    await RequirementAccess.as_group_organizer(requirement_group_id=requirement.requirement_group_id, user=user_session, 
                                               requirement_group_service=requirement_group_service,
                                               task_service=task_service)
    return await requirements_service.create_requirement(requirement)

@requirement_router.delete("/")
async def delete_requirements(ids: Annotated[list[int], Query], requirements_service: Annotated[RequirementService, Depends(RequirementService)],
                              user_session: Annotated[UserSession, Depends(TournamentAccess.as_organizer)]):
    for r_id in ids:
        await RequirementAccess.as_organizer(requirement_id=r_id, user=user_session, requirement_service=requirements_service)
    is_delete = await requirements_service.delete_requirements(ids)
    return is_delete