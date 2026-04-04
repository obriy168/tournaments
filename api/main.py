from fastapi import FastAPI, Body
from pydantic import BaseModel, Field
from typing import Annotated
from database.schemas.schema import Team, Tournament
from sqlmodel import create_engine, Session, SQLModel

from dotenv import load_dotenv
import os

load_dotenv()

engine = create_engine(os.getenv("DATABASE_URL"))

app = FastAPI()

@app.get("/team/{team_id}")
async def read_team(team_id: int):
    with Session(engine) as session:
        team = session.get(Team, team_id)
        if team is None:
            return {"error": "Team not found"}
        return team


@app.get("/teams")
async def read_item():
    with Session(engine) as session:
        teams = session.get(Team).all()
        return teams
    
@app.get("/tournaments")
async def get_tournaments():
    with Session(engine) as session:
        tournaments = session.query(Tournament).all()
        return tournaments
    
# @app.post("/test-tournament")
# async def test_tournament():
#     with Session(engine) as session:
#         tournament = Tournament(
#             name="Test Tournament",
#             description="This is a test tournament",
#             start_date="2026-01-01T00:00:00Z",
#             registartion_start_date="2025-12-01T00:00:00Z",
#             registration_end_date="2025-12-31T23:59:59Z",
#             max_teams=16,
#             min_user_count=1,
#             max_user_count=5,
#             status="upcoming"
#         )
#         session.add(tournament)
#         session.commit()
#     return {"message": "Tournament created successfully"}


@app.post("/tournament")
async def create_tournament(tournament: Tournament):
    with Session(engine) as session:
        session.add(tournament)
        session.commit()
        session.refresh(tournament)
        return tournament


@app.post("/team")
async def create_team(team: Team):
    with Session(engine) as session:
        session.add(team)
        session.commit()
        session.refresh(team)
        return team