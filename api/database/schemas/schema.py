from sqlmodel import SQLModel, Field, Relationship, DateTime
from datetime import datetime, timezone
from typing import Optional
from enum import Enum

def utcnow():
    return datetime.now(timezone.utc)

class TournamentStatus(str, Enum):
    DRAFT = "Draft"
    REGISTRATION = "Registration"
    RUNNING = "Running"
    FINISHED = "Finished"

class TaskStatus(str, Enum):
    DRAFT = "Draft"
    ACTIVE = "Active"
    SUBMISSION_CLOSED = "SubmissionClosed"
    EVALUATED = "Evaluated"

class RoleEnum(str, Enum):
    ADMIN = "Admin"
    ORGANIZER = "Organizer"
    JURY = "Jury"
    PARTICIPANT = "Participant"

class User(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    first_name: str = Field(nullable=False)
    last_name: str
    email: str = Field(nullable=False, unique=True)
    password: str = Field(nullable=False)
    user_teams: list["UserTeam"] = Relationship(back_populates="user", cascade_delete=True)
    user_roles: list["UserRole"] = Relationship(back_populates="user", cascade_delete=True)
    
class Team(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    tournament_id: int = Field(foreign_key="tournament.id", ondelete="CASCADE")
    name: str = Field(nullable=False)
    city: str
    organization: str
    tournament: "Tournament" = Relationship(back_populates="teams")
    user_teams: list["UserTeam"] = Relationship(back_populates="team", cascade_delete=True)
    submissions: list["Submission"] = Relationship(back_populates="team", cascade_delete=True)

class UserTeam(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", ondelete="CASCADE")
    team_id: int = Field(foreign_key="team.id", ondelete="CASCADE")
    is_lead: bool = Field(nullable=False)
    team: "Team" = Relationship(back_populates="user_teams")
    user: "User" = Relationship(back_populates="user_teams")

class Tournament(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    name: str = Field(nullable=False)
    description: str
    start_date: datetime = Field(default_factory=utcnow, sa_type=DateTime(timezone=True))
    registration_start_date: datetime = Field(default_factory=utcnow, sa_type=DateTime(timezone=True))
    registration_end_date: datetime = Field(default_factory=utcnow, sa_type=DateTime(timezone=True))
    max_teams: int = Field(nullable=False)
    min_user_count: int = Field(nullable=False)
    max_user_count: int = Field(nullable=False)
    status: TournamentStatus
    teams: list["Team"] = Relationship(back_populates="tournament", cascade_delete=True)
    user_roles: list["UserRole"] = Relationship(back_populates="tournament", cascade_delete=True)
    tasks: list["Task"] = Relationship(back_populates="tournament", cascade_delete=True)

class UserRole(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", ondelete="CASCADE")
    tournament_id: Optional[int] = Field(default=None, nullable=True, foreign_key="tournament.id", ondelete="CASCADE")
    role: RoleEnum = Field(nullable=False)
    user: "User" = Relationship(back_populates="user_roles")
    tournament: "Tournament" = Relationship(back_populates="user_roles")
    assignments: list["TaskAssignment"] = Relationship(back_populates="evaluator", cascade_delete=True)
    
class Task(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    tournament_id: int = Field(foreign_key="tournament.id", ondelete="CASCADE")
    name: str = Field(nullable=False)
    description: str = Field(nullable=False)
    specifications: str = Field(nullable=False)
    start_date: datetime = Field(default_factory=utcnow, sa_type=DateTime(timezone=True))
    end_date: datetime = Field(default_factory=utcnow, sa_type=DateTime(timezone=True))
    status: TaskStatus
    tournament: "Tournament" = Relationship(back_populates="tasks")
    submissions: list["Submission"] = Relationship(back_populates="task", cascade_delete=True)
    requirement_groups: list["RequirementGroup"] = Relationship(back_populates="task", cascade_delete=True)

class Requirement(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    name: str = Field(nullable=False)
    description: str = Field(nullable=False)
    max_score: int = Field(nullable=False)
    requirement_group_id: int = Field(foreign_key="requirementgroup.id", ondelete="CASCADE")
    requirement_group: "RequirementGroup" = Relationship(back_populates="requirements")
    evaluations: list["Evaluation"] = Relationship(back_populates="requirement", cascade_delete=True)

class RequirementGroup(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    name: str = Field(nullable=False)
    task_id: int = Field(foreign_key="task.id", ondelete="CASCADE")
    task: "Task" = Relationship(back_populates="requirement_groups")
    requirements: list["Requirement"] = Relationship(back_populates="requirement_group", cascade_delete=True)

class Submission(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    team_id: int = Field(foreign_key="team.id", ondelete="CASCADE")
    task_id: int = Field(foreign_key="task.id", ondelete="CASCADE")
    created_on: datetime = Field(default_factory=utcnow, sa_type=DateTime(timezone=True))
    github_url: str = Field(nullable=False)
    video_url: str = Field(nullable=False)
    live_demo_url: Optional[str] = Field(default=None)
    description: Optional[str] = Field(default=None)
    team: "Team" = Relationship(back_populates="submissions")
    task: "Task" = Relationship(back_populates="submissions")
    assignments: list["TaskAssignment"] = Relationship(back_populates="submission", cascade_delete=True)

class TaskAssignment(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    evaluator_id: int = Field(foreign_key="userrole.id", ondelete="CASCADE")
    submission_id: int = Field(foreign_key="submission.id", ondelete="CASCADE")
    is_completed: bool = Field(default=False)
    evaluator: "UserRole" = Relationship(back_populates="assignments")
    submission: "Submission" = Relationship(back_populates="assignments")
    evaluations: list["Evaluation"] = Relationship(back_populates="assignment", cascade_delete=True)

class Evaluation(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    assignment_id: int = Field(foreign_key="taskassignment.id", ondelete="CASCADE")
    requirement_id: int = Field(foreign_key="requirement.id", ondelete="CASCADE")
    scores: int = Field(nullable=False)
    comment: Optional[str] = None
    assignment: "TaskAssignment" = Relationship(back_populates="evaluations")
    requirement: "Requirement" = Relationship(back_populates="evaluations")