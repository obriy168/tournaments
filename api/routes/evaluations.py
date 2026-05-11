from fastapi import APIRouter, Depends, HTTPException
from typing import Annotated
from services.evaluation_service import EvaluationService
from services.models.evaluation_model import EvaluationModel
from enums.role_enum import RoleEnum
from util.role_required import RoleRequired
from util.auth import validate_session
from routes.models.user_session import UserSession

evaluation_router = APIRouter(prefix="/evaluations", tags=["evaluations"])

@evaluation_router.get("/{evaluation_id}")
async def get_evaluation_by_id(evaluation_id: int, evaluation_service: Annotated[EvaluationService, Depends(EvaluationService)],
                               user_session: Annotated[UserSession, Depends(validate_session)]):
    evaluation = await evaluation_service.get_evaluation_by_id(evaluation_id)
    if evaluation is None:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    return evaluation

@evaluation_router.get("/task/{task_id}")
async def get_evaluation_by_task_id(task_id: int, evaluation_service: Annotated[EvaluationService, Depends(EvaluationService)],
                               user_session: Annotated[UserSession, Depends(validate_session)]):
    return await evaluation_service.get_evaluations_by_task_id(task_id)

@evaluation_router.post("/")
async def create_evaluation(evaluation: EvaluationModel, evaluation_service: Annotated[EvaluationService, Depends(EvaluationService)],
                            user_session: Annotated[UserSession, Depends(RoleRequired([RoleEnum.JURY]))]):
    evaluation = await evaluation_service.create_evaluation(evaluation)
    if evaluation is None:
        raise HTTPException(status_code=400, detail="Invalid evaluation data")
    return evaluation

@evaluation_router.put("/{evaluation_id}")
async def update_evaluation(evaluation_id: int, evaluation: EvaluationModel, evaluation_service: Annotated[EvaluationService, Depends(EvaluationService)],
                            user_session: Annotated[UserSession, Depends(RoleRequired([RoleEnum.ADMIN, RoleEnum.JURY]))]):
    is_owner = await evaluation_service.check_evaluation_ownership(evaluation_id, user_session.user_id)
    if not is_owner:
        raise HTTPException(status_code=403, detail="You can only edit your own evaluations")
    evaluation = await evaluation_service.update_evaluation(evaluation_id, evaluation)
    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    return evaluation
