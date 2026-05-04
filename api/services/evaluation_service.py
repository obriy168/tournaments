from repositories.evaluation_repository import EvaluationRepository
from repositories.requirement_repository import RequirementRepository
from database.schemas.schema import Evaluation
from services.models.evaluation_model import EvaluationModel
from typing import Annotated
from fastapi import Depends

class EvaluationService:
    def __init__(self, evaluation_repository: Annotated[EvaluationRepository, Depends(EvaluationRepository)], requirement_repository: Annotated[RequirementRepository, Depends(RequirementRepository)]):
        self.evaluation_repository = evaluation_repository
        self.requirement_repository = requirement_repository

    async def get_evaluation_by_id(self, evaluation_id: int):
        return await self.evaluation_repository.get_by_id(evaluation_id)

    async def get_evaluations_by_task_id(self, task_id: int):
        return await self.evaluation_repository.get_evaluations_by_task_id(task_id)

    async def create_evaluation(self, evaluation: EvaluationModel) -> Evaluation:
        requirement_max_score = (await self.requirement_repository.get_by_id(evaluation.requirement_id)).max_score

        if evaluation.scores > requirement_max_score:
            return None
        
        data = evaluation.model_dump(exclude={"id"})
        evaluation_entity = Evaluation(**data)
        return await self.evaluation_repository.save(evaluation_entity)
    
    async def update_evaluation(self, evaluation_id: int, evaluation: EvaluationModel):
        db_evaluation = await self.evaluation_repository.get_by_id(evaluation_id)

        if not db_evaluation:
            return None
        
        new_evaluation = evaluation.model_dump(exclude_unset=True, exclude={"id"})
        db_evaluation.sqlmodel_update(new_evaluation)
        return await self.evaluation_repository.save(db_evaluation)