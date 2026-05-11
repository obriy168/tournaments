from fastapi import APIRouter, Depends, HTTPException
from services.requirement_group_service import RequirementGroupService
from services.tournaments_service import TournamentsService
from typing import Annotated
from services.models.requirement_group_model import RequirementGroupModel
from enums.role_enum import RoleEnum
from util.role_required import RoleRequired
from util.auth import validate_session
from routes.models.user_session import UserSession

requirement_group_router = APIRouter(prefix="/requirement_groups", tags=["requirement_groups"])

async def check_tournament_access(tournament_id: int, user_session: UserSession, service: TournamentsService):
    if user_session.is_admin:
        return

    organizers = await service.get_organizers(tournament_id)
    organizer_ids = [org.user_id for org in organizers]

    if user_session.user_id not in organizer_ids:
        raise HTTPException(status_code=403, detail="Forbidden: you are not an organizer of this tournament.")
    
@requirement_group_router.post("/")
async def create_requirement_group(requirement_group: RequirementGroupModel, 
                                   requirements_group_service: Annotated[RequirementGroupService, Depends(RequirementGroupService)],
                                   tournaments_service: Annotated[TournamentsService, Depends(TournamentsService)],
                                   user_session: Annotated[UserSession, Depends(RoleRequired([RoleEnum.ADMIN, RoleEnum.ORGANIZER]))]):
    tournament_id = await requirements_group_service.get_tournament_id_by_task_id(requirement_group.task_id)
    
    await check_tournament_access(tournament_id, user_session, tournaments_service)
    return await requirements_group_service.create_requirement_group(requirement_group)

@requirement_group_router.get("/{task_id}")
async def get_requirement_groups_by_task_id(task_id: int, 
                                            requirements_group_service: Annotated[RequirementGroupService, Depends(RequirementGroupService)],
                                            user_session: Annotated[UserSession, Depends(validate_session)]):
    return await requirements_group_service.get_requirement_groups_by_task_id(task_id)

@requirement_group_router.delete("/{requirement_group_id}")
async def delete_requirement_group(requirement_group_id: int, 
                                   requirements_group_service: Annotated[RequirementGroupService, Depends(RequirementGroupService)],
                                   tournaments_service: Annotated[TournamentsService, Depends(TournamentsService)],
                                   user_session: Annotated[UserSession, Depends(RoleRequired([RoleEnum.ADMIN, RoleEnum.ORGANIZER]))]):
    tournament_id = await requirements_group_service.get_tournament_id_by_group(requirement_group_id)
    
    await check_tournament_access(tournament_id, user_session, tournaments_service)
    is_deleted = await requirements_group_service.delete_requirement_group(requirement_group_id)
    if not is_deleted:
        raise HTTPException(status_code=404, detail="Requirement group not found")
    return {"detail": "Deleted successfully"}