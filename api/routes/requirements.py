from fastapi import APIRouter, Depends, Query, HTTPException
from enums.role_enum import RoleEnum
from services.tournaments_service import TournamentsService
from services.requirement_service import RequirementService
from typing import Annotated
from services.models.requirement_model import RequirementModel
from util.role_required import RoleRequired
from util.auth import validate_session
from routes.models.user_session import UserSession

requirement_router = APIRouter(prefix="/requirements", tags=["requirements"])

async def check_tournament_access(tournament_id: int, user_session: UserSession, service: TournamentsService):
    if user_session.is_admin:
        return

    organizers = await service.get_organizers(tournament_id)
    organizer_ids = [org.user_id for org in organizers]

    if user_session.user_id not in organizer_ids:
        raise HTTPException(status_code=403, detail="Forbidden: you are not an organizer of this tournament.")

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
                             tournaments_service: Annotated[TournamentsService, Depends(TournamentsService)],
                             user_session: Annotated[UserSession, Depends(RoleRequired([RoleEnum.ADMIN, RoleEnum.ORGANIZER]))]):
    tournament_id = await requirements_service.get_tournament_id_by_group_id(requirement.requirement_group_id)
    
    if not tournament_id:
        raise HTTPException(status_code=404, detail="Requirement group not found")

    await check_tournament_access(tournament_id, user_session, tournaments_service)

    return await requirements_service.create_requirement(requirement)

@requirement_router.delete("/")
async def delete_requirements(ids: Annotated[list[int], Query], requirements_service: Annotated[RequirementService, Depends(RequirementService)],
                              tournaments_service: Annotated[TournamentsService, Depends(TournamentsService)],
                              user_session: Annotated[UserSession, Depends(RoleRequired([RoleEnum.ADMIN, RoleEnum.ORGANIZER]))]):
    if ids:
        tournament_id = await requirements_service.get_tournament_id_by_requirement_id(ids[0])
        await check_tournament_access(tournament_id, user_session, tournaments_service)

    is_delete = await requirements_service.delete_requirements(ids)
    return is_delete