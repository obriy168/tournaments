from fastapi import APIRouter, Depends, HTTPException
from enums.role_enum import RoleEnum
from routes.models.user_session import UserSession
from services.models.tournament_model import TournamentModel
from services.tournaments_service import TournamentsService
from typing import Annotated
from util.role_required import RoleRequired

tournament_router = APIRouter(prefix="/tournaments", tags=["tournaments"])

async def check_tournament_access(tournament_id: int, user_session: UserSession, service: TournamentsService):
    if user_session.is_admin:
        return

    organizers = await service.get_organizers(tournament_id)
    organizer_ids = [org.user_id for org in organizers]

    if user_session.user_id not in organizer_ids:
        raise HTTPException(status_code=403, detail="Forbidden: you are not an organizer of this tournament.")
    
@tournament_router.get("/{tournament_id}")
async def read_tournament_by_id(tournament_id: int, tournaments_service: Annotated[TournamentsService, Depends(TournamentsService)]):
    tournament = await tournaments_service.get_tournament_by_id(tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    return tournament

@tournament_router.get("/")
async def read_tournaments(tournaments_service: Annotated[TournamentsService, Depends(TournamentsService)]):
    tournaments = await tournaments_service.get_all_tournaments()
    return tournaments

@tournament_router.post("/")
async def create_tournament(tournament: TournamentModel, tournaments_service: Annotated[TournamentsService, Depends(TournamentsService)], 
                            user_session: Annotated[UserSession, Depends(RoleRequired([RoleEnum.ADMIN, RoleEnum.ORGANIZER]))]):
    return await tournaments_service.create_tournament(tournament)

@tournament_router.put("/{tournament_id}")
async def update_tournament(tournament_id: int, tournament: TournamentModel, tournaments_service: Annotated[TournamentsService, Depends(TournamentsService)],
                            user_session: Annotated[UserSession, Depends(RoleRequired([RoleEnum.ADMIN, RoleEnum.ORGANIZER]))]):
    await check_tournament_access(tournament_id, user_session, tournaments_service)
    
    tournament = await tournaments_service.update_tournament(tournament_id, tournament)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    return tournament

@tournament_router.patch("/{tournament_id}/status")
async def update_tournament_status(tournament_id: int, status: str, tournaments_service: Annotated[TournamentsService, Depends(TournamentsService)],
                                   user_session: Annotated[UserSession, Depends(RoleRequired([RoleEnum.ADMIN, RoleEnum.ORGANIZER]))]):
    
    await check_tournament_access(tournament_id, user_session, tournaments_service)
    
    tournament = await tournaments_service.update_tournament_status(tournament_id, status)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    return tournament


@tournament_router.delete("/{tournament_id}")
async def delete_tournament(tournament_id: int, tournaments_service: Annotated[TournamentsService, Depends(TournamentsService)],
                            user_session: Annotated[UserSession, Depends(RoleRequired([RoleEnum.ADMIN, RoleEnum.ORGANIZER]))]):
    await check_tournament_access(tournament_id, user_session, tournaments_service)
    
    is_deleted = await tournaments_service.delete_tournament(tournament_id)
    if not is_deleted:
        raise HTTPException(status_code=404, detail="Tournament not found")
    return {"detail": "Tournament deleted successfully"}
