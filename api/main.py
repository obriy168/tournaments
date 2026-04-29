from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.tournaments import tournament_router
from routes.teams import team_router
from routes.users import user_router
from routes.users_team import user_team_router
from routes.tasks import task_router
from routes.user_role import user_role_router
from routes.requirements import requirement_router
from routes.requirements_group import requirement_group_router
from routes.submissions import submissions_router
from routes.tasks_assignment import task_assignment_router
from routes.evaluations import evaluation_router

app = FastAPI()
    
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tournament_router)
app.include_router(team_router)
app.include_router(user_router)
app.include_router(user_team_router)
app.include_router(task_router)
app.include_router(user_role_router)
app.include_router(requirement_router)
app.include_router(requirement_group_router)
app.include_router(submissions_router)
app.include_router(task_assignment_router)
app.include_router(evaluation_router)