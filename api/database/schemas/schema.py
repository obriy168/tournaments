from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime, timezone
from typing import Literal

class Team(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    tournament_id: int = Field(foreign_key="tournament.id")
    name: str = Field(nullable=False)
    city: str
    organization: str
    tournament: Tournament = Relationship(back_populates="teams")

class Tournament(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    name: str = Field(nullable=False)
    description: str
    start_date: datetime = Field(default_factory=datetime.now(tz=timezone.utc))
    registartion_start_date: datetime = Field(default_factory=datetime.now(tz=timezone.utc))
    registration_end_date: datetime = Field(default_factory=datetime.now(tz=timezone.utc))
    max_teams: int = Field(nullable=False)
    min_user_count: int = Field(nullable=False)
    max_user_count: int = Field(nullable=False)
    status: str
    teams: list[Team] = Relationship(back_populates="tournament")