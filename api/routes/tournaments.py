from services.models.tournament_model import TournamentModel
from services.tournaments_service import TournamentsService
from fastapi import APIRouter, Depends, HTTPException
from typing import Annotated

tournament_router = APIRouter(prefix="/tournaments", tags=["tournaments"])

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
async def create_tournament(tournament: TournamentModel, tournaments_service: Annotated[TournamentsService, Depends(TournamentsService)]):
    return await tournaments_service.create_tournament(tournament)

@tournament_router.put("/{tournament_id}")
async def update_tournament(tournament_id: int, tournament: TournamentModel, tournaments_service: Annotated[TournamentsService, Depends(TournamentsService)]):
    tournament = await tournaments_service.update_tournament(tournament_id, tournament)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    return tournament

@tournament_router.patch("/{tournament_id}/status")
async def update_tournament_status(tournament_id: int, status: str, tournaments_service: Annotated[TournamentsService, Depends(TournamentsService)]):
    tournament = await tournaments_service.update_tournament_status(tournament_id, status)
    if not tournament:
        raise HTTPException(status_code=400, detail="Status transition not allowed or tournament not found")
    return tournament

@tournament_router.delete("/{tournament_id}")
async def delete_tournament(tournament_id: int, tournaments_service: Annotated[TournamentsService, Depends(TournamentsService)]):
    is_deleted = await tournaments_service.delete_tournament(tournament_id)
    if not is_deleted:
        raise HTTPException(status_code=404, detail="Tournament not found")
    return {"detail": "Tournament deleted successfully"}

