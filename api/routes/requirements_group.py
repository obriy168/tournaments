from fastapi import APIRouter, Depends, HTTPException
from services.requirement_group_service import RequirementGroupService
from services.task_service import TaskService
from typing import Annotated
from services.models.requirement_group_model import RequirementGroupModel
from util.role_required import RequirementGroupAccess
from util.auth import validate_session
from routes.models.user_session import UserSession

requirement_group_router = APIRouter(prefix="/requirement_groups", tags=["requirement_groups"])
    
@requirement_group_router.post("/")
async def create_requirement_group(requirement_group: RequirementGroupModel, 
                                   requirements_group_service: Annotated[RequirementGroupService, Depends(RequirementGroupService)],
                                   task_service: Annotated[TaskService, Depends(TaskService)],
                                   user_session: Annotated[UserSession, Depends(validate_session)]):
    await RequirementGroupAccess.as_task_organizer(task_id=requirement_group.task_id, user=user_session, task_service=task_service)

    return await requirements_group_service.create_requirement_group(requirement_group)

@requirement_group_router.get("/{task_id}")
async def get_requirement_groups_by_task_id(task_id: int, 
                                            requirements_group_service: Annotated[RequirementGroupService, Depends(RequirementGroupService)],
                                            user_session: Annotated[UserSession, Depends(validate_session)]):
    return await requirements_group_service.get_requirement_groups_by_task_id(task_id)

@requirement_group_router.delete("/{requirement_group_id}")
async def delete_requirement_group(requirement_group_id: int, 
                                   requirements_group_service: Annotated[RequirementGroupService, Depends(RequirementGroupService)],
                                   user_session: Annotated[UserSession, Depends(RequirementGroupAccess.as_organizer)]):
    is_deleted = await requirements_group_service.delete_requirement_group(requirement_group_id)
    if not is_deleted:
        raise HTTPException(status_code=404, detail="Requirement group not found")
    return {"detail": "Deleted successfully"}