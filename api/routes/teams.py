from fastapi import FastAPI, APIRouter
from sqlmodel import create_engine, Session
from dotenv import load_dotenv
from database.schemas.schema import Team
import os

load_dotenv()

engine = create_engine(os.getenv("DATABASE_URL"))

team_router = APIRouter(prefix="/teams", tags=["teams"])

@team_router.get("/{team_id}")
async def read_team(team_id: int):
    with Session(engine) as session:
        team = session.get(Team, team_id)
        if team is None:
            return {"error": "Team not found"}
        return team


@team_router.get("/")
async def read_item():
    with Session(engine) as session:
        teams = session.get(Team).all()
        return teams
    



@team_router.post("/")
async def create_team(team: Team):
    with Session(engine) as session:
        session.add(team)
        session.commit()
        session.refresh(team)
        return team