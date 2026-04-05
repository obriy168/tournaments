from fastapi import FastAPI, Body
from pydantic import BaseModel, Field
from typing import Annotated
from database.schemas.schema import Team, Tournament
from sqlmodel import create_engine, Session, SQLModel
from routes.tournaments import tournament_router
from routes.teams import team_router

from dotenv import load_dotenv
import os

load_dotenv()

engine = create_engine(os.getenv("DATABASE_URL"))

app = FastAPI()


    
app.include_router(tournament_router)
app.include_router(team_router)
