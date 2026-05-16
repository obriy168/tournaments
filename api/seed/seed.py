import asyncio
import random
from datetime import datetime, timedelta, timezone
from faker import Faker
from polyfactory import Use
from polyfactory.factories.pydantic_factory import ModelFactory
from util.database import async_session_factory
from database.schemas.schema import (
    Tournament, Team, Submission, Evaluation, Task, RequirementGroup, 
    Requirement, User, UserRole, UserTeam, TaskAssignment
)
from enums.role_enum import RoleEnum
from enums.task_status_enum import TaskStatus
from enums.tournament_status_enum import TournamentStatus
from services.models.tournament_model import TournamentModel
from services.models.team_model import TeamModel
from services.models.user_model import UserModel
from services.models.task_model import TaskModel
from services.models.requirement_group_model import RequirementGroupModel
from services.models.requirement_model import RequirementModel
from services.models.submission_model import SubmissionModel
from services.models.evaluation_model import EvaluationModel
from services.models.task_assigment_model import TaskAssigmentModel

from pwdlib import PasswordHash
from sqlalchemy import select

fake = Faker()

def hash_password(password: str) -> str:
    password_hash = PasswordHash(hashers=["argon2"]).recommended()
    return password_hash.hash(password)

class TournamentFactory(ModelFactory[TournamentModel]):
    __model__ = TournamentModel
    name = Use(lambda: (
        f"{random.choice(['AI & Deep Learning', 'Web Development', 'Cybersecurity', 'Data Science', 'DevOps & Cloud', 'Mobile Development', 'GameDev Frameworks', 'Blockchain Innovation'])} "
        f"{random.choice(['Cup', 'Championship', 'Challenge', 'Hackathon', 'Marathon', 'Summit'])} "
        f"{random.choice(['', '', datetime.now(timezone.utc).year])}"
    ).strip())
    description = Use(fake.paragraph)
    registration_start_date = Use(lambda: datetime.now(timezone.utc) - timedelta(days=random.randint(1, 30)))
    registration_end_date = Use(lambda: datetime.now(timezone.utc) + timedelta(days=random.randint(1, 10)))
    start_date = Use(lambda: datetime.now(timezone.utc) + timedelta(days=random.randint(11, 20)))
    max_teams = Use(lambda: random.randint(10, 50))
    min_user_count = Use(lambda: 2)
    max_user_count = Use(lambda: 5)
    status = Use(lambda: random.choice(list(TournamentStatus)))

class TeamFactory(ModelFactory[TeamModel]):
    __model__ = TeamModel
    name = Use(lambda: fake.color_name() + " Team")
    city = Use(fake.city)
    organization = Use(fake.company)

class UserFactory(ModelFactory[UserModel]):
    __model__ = UserModel
    first_name = Use(fake.first_name)
    last_name = Use(fake.last_name)
    email = Use(fake.unique.email)
    password = Use(lambda: hash_password("12345678"))

class TaskFactory(ModelFactory[TaskModel]):
    __model__ = TaskModel
    name = Use(lambda: fake.bs().title())
    description = Use(fake.paragraph)
    specifications = Use(fake.text)
    start_date = Use(lambda: datetime.now(timezone.utc))
    end_date = Use(lambda: datetime.now(timezone.utc) + timedelta(days=random.randint(3, 14)))
    status = Use(lambda: random.choice(list(TaskStatus)))

class RequirementGroupFactory(ModelFactory[RequirementGroupModel]):
    __model__ = RequirementGroupModel
    name = Use(lambda: random.choice(["Backend", "Frontend", "Architecture", "Presentation", "Security", "DevOps"]))

class RequirementFactory(ModelFactory[RequirementModel]):
    __model__ = RequirementModel
    name = Use(lambda: random.choice(["Code Quality", "Testing", "Performance", "Scalability", "UI/UX", "Security", "Documentation"]))
    description = Use(fake.sentence)
    max_score = Use(lambda: random.choice([5, 10, 20]))

class SubmissionFactory(ModelFactory[SubmissionModel]):
    __model__ = SubmissionModel
    github_url = Use(fake.url)
    video_url = Use(fake.url)
    live_demo_url = Use(fake.url)
    description = Use(fake.paragraph)
    created_on = Use(lambda: datetime.now(timezone.utc))

class TaskAssignmentFactory(ModelFactory[TaskAssigmentModel]):
    __model__ = TaskAssigmentModel
    is_completed = Use(lambda: random.choice([True, False]))

class EvaluationFactory(ModelFactory[EvaluationModel]):
    __model__ = EvaluationModel
    scores = Use(lambda: random.randint(1, 10))
    comment = Use(fake.sentence)

def create_user(s): return User(**s.model_dump(exclude={"id"}))
def create_team(s): return Team(**s.model_dump(exclude={"id"}))
def create_tournament(s): return Tournament(**s.model_dump(exclude={"id"}))
def create_task(s): return Task(**s.model_dump(exclude={"id"}))
def create_requirement_group(s): return RequirementGroup(**s.model_dump(exclude={"id"}))
def create_requirement(s): return Requirement(**s.model_dump(exclude={"id"}))
def create_submission(s): return Submission(**s.model_dump(exclude={"id"}))
def create_assignment(s): return TaskAssignment(**s.model_dump(exclude={"id"}))
def create_evaluation(s): return Evaluation(**s.model_dump(exclude={"id"}))

async def seed_data():
    async with async_session_factory() as session:
        with open('/app/seed_log/users.txt', 'w', encoding='utf-8') as file:
            print("=== SEED STARTED ===")
            file.write("All users that created in seed.py have password: 12345678 \n")
            admin_email = "admin@system.com"
            file.write(f"Admin email: {admin_email} \n")
            
            result = await session.execute(select(User).where(User.email == admin_email))
            admin = result.scalar_one_or_none()

            print("[1/6] Creating admin...", end="\r")

            if not admin:
                admin = create_user(UserFactory.build(
                    first_name="Admin", 
                    last_name="Root", 
                    email=admin_email
                ))
                session.add(admin)
                await session.flush()
                session.add(UserRole(user_id=admin.id, role=RoleEnum.ADMIN))

            print("[2/6] Creating users pool...", end="\r")

            users_pool = [create_user(UserFactory.build()) for _ in range(100)]
            session.add_all(users_pool)
            await session.flush()

            print("[3/6] Loading users from database...", end="\r")

            db_users_result = await session.execute(select(User))
            db_users = db_users_result.scalars().all()
            
            print("\r" + " " * 100, end="\r")
            print("[4/6] Creating tournaments...", end="\r")

            tournaments = [create_tournament(TournamentFactory.build()) for _ in range(20)]
            session.add_all(tournaments)
            await session.flush()
            
            tournament_len = len(tournaments)
            num_of_iteractions = 0

            for tournament in tournaments:
                num_of_iteractions += 1

                file.write(f"\n===TOURNAMENT '{tournament.name}' \n")
                file.write("==ORGANIZERS==\n")

                print(f"[{num_of_iteractions}/{tournament_len}] Assigning organizers and jury...", end="\r")

                tournament_organizers = random.sample(db_users, 2)
                for organizer in tournament_organizers:
                    session.add(UserRole(user_id=organizer.id, tournament_id=tournament.id, role=RoleEnum.ORGANIZER))
                    file.write(f"Organizer email {organizer.email} \n")
                
                file.write(" \n==JURY==\n")

                tournament_jury = random.sample(db_users, 5)
                for jury in tournament_jury:
                    session.add(UserRole(user_id=jury.id, tournament_id=tournament.id, role=RoleEnum.JURY))
                    file.write(f"Jury email {jury.email} \n") 

                print(f"[{num_of_iteractions}/{tournament_len}] Creating teams and participants...", end="\r")

                teams = [create_team(TeamFactory.build(tournament_id=tournament.id)) for _ in range(random.randint(5, 10))]
                session.add_all(teams)
                await session.flush()

                file.write(f"\n==TOURNAMENT TEAMS== \n")

                for team in teams:
                    file.write(f" \n=TEAM {team.name}= \n")

                    members = random.sample(db_users, random.randint(tournament.min_user_count, tournament.max_user_count))
                    captain = members[0]
                    for member in members:
                        session.add(UserRole(user_id=member.id, tournament_id=tournament.id, role=RoleEnum.PARTICIPANT))
                        session.add(UserTeam(user_id=member.id, team_id=team.id, is_lead=(member.id == captain.id)))
                    
                    file.write(f"Captain email {captain.email}\n")
                    for member in members[1:]:
                        file.write(f"Team member email {member.email}\n")

                print(f"[{num_of_iteractions}/{tournament_len}] Creating tasks, requirement groups and requirements...", end="\r")

                task_to_requirements = {}
                tasks = [create_task(TaskFactory.build(tournament_id=tournament.id)) for _ in range(random.randint(2, 5))]
                session.add_all(tasks)
                await session.flush()

                for task in tasks:
                    task_to_requirements[task.id] = []
                    groups = [create_requirement_group(RequirementGroupFactory.build(task_id=task.id)) for _ in range(random.randint(2, 4))]
                    session.add_all(groups)
                    await session.flush()
                    for group in groups:
                        reqs = [create_requirement(RequirementFactory.build(requirement_group_id=group.id)) for _ in range(random.randint(3, 6))]
                        session.add_all(reqs)
                        task_to_requirements[task.id].extend(reqs)
                    await session.flush()

                print(f"[{num_of_iteractions}/{tournament_len}] Creating submissions, assignments and evaluations...", end="\r")

                submissions = []
                for task in tasks:
                    if task.status != TaskStatus.DRAFT:
                        for team in random.sample(teams, random.randint(1, len(teams))):
                            submissions.append(create_submission(SubmissionFactory.build(team_id=team.id, task_id=task.id)))
                session.add_all(submissions)
                await session.flush()

                submissions_dict = {s.id: s for s in submissions}

                assignments = []
                for submission in submissions:
                    for jury in random.sample(tournament_jury, 2):
                        assignments.append(create_assignment(TaskAssignmentFactory.build(evaluator_id=jury.id, submission_id=submission.id)))
                session.add_all(assignments)
                await session.flush()

                for assignment in assignments:
                    sub = submissions_dict[assignment.submission_id]
                    all_reqs = task_to_requirements.get(sub.task_id, [])
                    for req in all_reqs:
                        session.add(create_evaluation(EvaluationFactory.build(assignment_id=assignment.id, requirement_id=req.id)))

                print("\r" + " " * 100, end="\r")
                print(f"Tournament {num_of_iteractions}/{tournament_len} created")

        print("[6/6] Committing changes to database...", end="\r")
        await session.commit()
        print("\r" + " " * 100, end="\r")
        print("=== SEED COMPLETED ===")

if __name__ == "__main__":
    asyncio.run(seed_data())