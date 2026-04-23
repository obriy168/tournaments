from repositories.tournament_repository import TournamentRepository
from database.schemas.schema import Tournament, TournamentStatus
from services.models.tournament_model import TournamentModel
from typing import Annotated
from fastapi import Depends

class TournamentsService:
    def __init__(self, tournament_repository: Annotated[TournamentRepository, Depends(TournamentRepository)]):
        self.tournament_repository = tournament_repository

    async def get_all_tournaments(self):
        return await self.tournament_repository.get_all()
    
    async def get_tournament_by_id(self, tournament_id: int):
        return await self.tournament_repository.get_by_id(tournament_id)

    async def create_tournament(self, tournament: TournamentModel) -> Tournament:
        data = tournament.model_dump(exclude={"id"})
        tournament_entity = Tournament(**data)

        return await self.tournament_repository.save(tournament_entity)

    async def update_tournament(self, tournament_id: int, tournament: TournamentModel) -> Tournament:
        db_tournament = await self.tournament_repository.get_by_id(tournament_id)
    
        if not db_tournament:
            return None
        new_tournament = tournament.model_dump(exclude_unset=True, exclude={"id"})

        db_tournament.sqlmodel_update(new_tournament)

        return await self.tournament_repository.save(db_tournament)

    async def update_tournament_status(self, tournament_id: int, status: str) -> Tournament:
        db_tournament = await self.tournament_repository.get_by_id(tournament_id)
    
        if not db_tournament:
            return None
        
        allowed_transitions = {
            TournamentStatus.DRAFT: [TournamentStatus.REGISTRATION],
            TournamentStatus.REGISTRATION: [TournamentStatus.RUNNING, TournamentStatus.DRAFT],
            TournamentStatus.RUNNING: [TournamentStatus.FINISHED],
            TournamentStatus.FINISHED: []
        }
        
        if db_tournament.status == status:
            return None
        
        if status not in allowed_transitions.get(db_tournament.status, []):
            return None
    
        db_tournament.status = status
    
        return await self.tournament_repository.save(db_tournament)

    async def delete_tournament(self, tournament_id: int) -> bool:
        tournament = await self.tournament_repository.get_by_id(tournament_id)
        if tournament is None:
            return False
        return await self.tournament_repository.delete(tournament)
