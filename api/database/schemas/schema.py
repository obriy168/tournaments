from sqlmodel import SQLModel, Field, Relationship
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

class User(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    first_name: str = Field(nullable=False)
    last_name: str
    email: str = Field(nullable=False, unique=True)
    password: int = Field(nullable=False)
    user_teams: list["UserTeam"] = Relationship(back_populates="user")
    user_roles: list["UserRole"] = Relationship(back_populates="user")
    jury_member: Optional["JuryMember"] = Relationship(back_populates="user")
    
class Team(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    tournament_id: int = Field(foreign_key="tournament.id")
    name: str = Field(nullable=False)
    city: str
    organization: str
    tournament: "Tournament" = Relationship(back_populates="teams")
    user_teams: list["UserTeam"] = Relationship(back_populates="team")
    submissions: list["Submission"] = Relationship(back_populates="team")

class UserTeam(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    team_id: int = Field(foreign_key="team.id")
    is_lead: bool = Field(nullable=False)
    team: "Team" = Relationship(back_populates="user_teams")
    user: "User" = Relationship(back_populates="user_teams")

class Tournament(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    name: str = Field(nullable=False)
    description: str
    start_date: datetime = Field(default_factory=utcnow)
    registration_start_date: datetime = Field(default_factory=utcnow)
    registration_end_date: datetime = Field(default_factory=utcnow)
    max_teams: int = Field(nullable=False)
    min_user_count: int = Field(nullable=False)
    max_user_count: int = Field(nullable=False)
    status: TournamentStatus
    teams: list["Team"] = Relationship(back_populates="tournament")
    user_roles: list["UserRole"] = Relationship(back_populates="tournament")
    tasks: list["Task"] = Relationship(back_populates="tournament")

class Role(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    name: str = Field(nullable=False)
    user_roles: list["UserRole"] = Relationship(back_populates="role")

class UserRole(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    role_id: int = Field(foreign_key="role.id")
    user_id: int = Field(foreign_key="user.id")
    tournament_id: int = Field(foreign_key="tournament.id")
    role: "Role" = Relationship(back_populates="user_roles")
    user: "User" = Relationship(back_populates="user_roles")
    tournament: "Tournament" = Relationship(back_populates="user_roles")
    

class Task(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    tournament_id: int = Field(foreign_key="tournament.id")
    name: str = Field(nullable=False)
    description: str = Field(nullable=False)
    specifications: str = Field(nullable=False)
    start_date: datetime = Field(default_factory=utcnow)
    end_date: datetime = Field(default_factory=utcnow)
    status: TaskStatus
    tournament: "Tournament" = Relationship(back_populates="tasks")
    task_requirements: list["TaskRequirement"] = Relationship(back_populates="task")
    submissions: list["Submission"] = Relationship(back_populates="task")
    jury_members: list["JuryMember"] = Relationship(back_populates="task")

class Requirement(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    name: str = Field(nullable=False)
    description: str = Field(nullable=False)
    max_score: int = Field(nullable=False)
    requirement_group_id: int = Field(foreign_key="requirementgroup.id")
    requirement_group: "RequirementGroup" = Relationship(back_populates="requirements")
    task_requirements: list["TaskRequirement"] = Relationship(back_populates="requirement")

class RequirementGroup(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    name: str = Field(nullable=False)
    requirements: list["Requirement"] = Relationship(back_populates="requirement_group")

class TaskRequirement(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    task_id: int = Field(foreign_key="task.id")
    requirement_id: int = Field(foreign_key="requirement.id")
    max_scores: int = Field(nullable=False)
    task: "Task" = Relationship(back_populates="task_requirements")
    requirement: "Requirement" = Relationship(back_populates="task_requirements")
    evaluations: list["Evaluation"] = Relationship(back_populates="task_requirement")

class Submission(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    team_id: int = Field(foreign_key="team.id")
    task_id: int = Field(foreign_key="task.id")
    created_on: datetime = Field(default_factory=datetime.now(tz=timezone.utc))
    team: "Team" = Relationship(back_populates="submissions")
    task: "Task" = Relationship(back_populates="submissions")
    evaluations: list["Evaluation"] = Relationship(back_populates="submission")

class JuryMember(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", unique=True)
    task_id: int = Field(foreign_key="task.id")
    user: "User" = Relationship(back_populates="jury_member")
    task: "Task" = Relationship(back_populates="jury_members")
    evaluations: list["Evaluation"] = Relationship(back_populates="jury_member")

class Evaluation(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    jury_member_id: int = Field(foreign_key="jurymember.id")
    submission_id: int = Field(foreign_key="submission.id")
    task_requirement_id: int = Field(foreign_key="taskrequirement.id")
    scores: int = Field(nullable=False)
    jury_member: "JuryMember" = Relationship(back_populates="evaluations")
    submission: "Submission" = Relationship(back_populates="evaluations")
    task_requirement: "TaskRequirement" = Relationship(back_populates="evaluations")

