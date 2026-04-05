from fastapi import FastAPI, APIRouter
from sqlmodel import create_engine, Session
from dotenv import load_dotenv
from database.schemas.schema import Tournament
import os

tournament_router = APIRouter(prefix="/tournaments", tags=["tournaments"])

load_dotenv()

engine = create_engine(os.getenv("DATABASE_URL"))

@tournament_router.get("/")
async def get_tournaments():
    with Session(engine) as session:
        tournaments = session.query(Tournament).all()
        return tournaments
    
@tournament_router.post("/test-tournament")
async def test_tournament():
    with Session(engine) as session:
        tournament = Tournament(
            name="Test Tournament",
            description="This is a test tournament",
            start_date="2026-01-01T00:00:00Z",
            registartion_start_date="2025-12-01T00:00:00Z",
            registration_end_date="2025-12-31T23:59:59Z",
            max_teams=16,
            min_user_count=1,
            max_user_count=5,
            status="Draft"
        )
        session.add(tournament)
        session.commit()
    return {"message": "Tournament created successfully"}


@tournament_router.post("/tournament")
async def create_tournament(tournament: Tournament):
    with Session(engine) as session:
        session.add(tournament)
        session.commit()
        session.refresh(tournament)
        return tournament