from fastapi import APIRouter, Depends, HTTPException
from typing import Annotated
from services.evaluation_service import EvaluationService
from services.task_assigment_service import TaskAssignmentService
from services.models.evaluation_model import EvaluationModel
from util.role_required import EvaluationAccess
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
                            assignment_service: Annotated[TaskAssignmentService, Depends(TaskAssignmentService)],
                            user_session: Annotated[UserSession, Depends(validate_session)]):
    await EvaluationAccess.as_jury_of_tournament(task_assignment_id=evaluation.assignment_id, user=user_session, assignment_service=assignment_service)

    evaluation = await evaluation_service.create_evaluation(evaluation)
    if evaluation is None:
        raise HTTPException(status_code=400, detail="Invalid evaluation data")
    return evaluation

@evaluation_router.put("/{evaluation_id}")
async def update_evaluation(evaluation_id: int, evaluation: EvaluationModel, evaluation_service: Annotated[EvaluationService, Depends(EvaluationService)],
                            user_session: Annotated[UserSession, Depends(EvaluationAccess.can_modify_evaluation)]):
    evaluation = await evaluation_service.update_evaluation(evaluation_id, evaluation)
    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    return evaluation
