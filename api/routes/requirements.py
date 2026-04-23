from fastapi import APIRouter
from services.requirement_service import Requirement
from fastapi import Depends, HTTPException
from typing import Annotated
from services.models.requirement_model import RequirementModel

requirement_router = APIRouter(prefix="/requirements", tags=["requirements"])