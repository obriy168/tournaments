from fastapi import APIRouter, Query
from typing import Annotated
from fastapi import Depends, HTTPException
from services.evaluation_service import EvaluationService
from services.models.evaluation_model import EvaluationModel

evaluation_router = APIRouter(prefix="/evaluations", tags=["evaluations"])

@evaluation_router.get("/{evaluation_id}")
async def get_evaluation_by_id(evaluation_id: int, evaluation_service: Annotated[EvaluationService, Depends(EvaluationService)]):
    evaluation = await evaluation_service.get_evaluation_by_id(evaluation_id)
    if evaluation is None:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    return evaluation

@evaluation_router.get("/{task_id}")
async def get_evaluation_by_id(task_id: int, evaluation_service: Annotated[EvaluationService, Depends(EvaluationService)]):
    return await evaluation_service.get_evaluations_by_task_id(task_id)

@evaluation_router.post("/")
async def create_evaluation(evaluation: EvaluationModel, evaluation_service: Annotated[EvaluationService, Depends(EvaluationService)]):
    return await evaluation_service.create_evaluation(evaluation)

@evaluation_router.put("/{evaluation_id}")
async def update_evaluation(evaluation_id: int, evaluation: EvaluationModel, evaluation_service: Annotated[EvaluationService, Depends(EvaluationService)]):
    evaluation = await evaluation_service.update_evaluation(evaluation_id, evaluation)
    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    return evaluation
