from fastapi import APIRouter
from services.requirement_group_service import RequirementGroup
from fastapi import Depends, HTTPException
from typing import Annotated
from services.models.requirement_group_model import RequirementGroupModel

requirement_group_router = APIRouter(prefix="/requirement_groups", tags=["requirement_groups"])