from repositories.jury_member_repository import JuryMemberRepository
from database.schemas.schema import JuryMember
from services.models.jury_member_model import JuryMemberModel
from typing import Annotated
from fastapi import Depends

class JuryMemberService:
    def __init__(self, jury_member_repository: Annotated[JuryMemberRepository, Depends(JuryMemberRepository)]):
        self.jury_member_repository = jury_member_repository

    async def get_jury_member_by_id(self, task_id: int):
        return await self.jury_member_repository.get_by_id(task_id)
    
    async def create_jury_member(self, jury_member: JuryMemberModel) -> JuryMember:
        data = jury_member.model_dump(exclude={"id"})
        jury_member_entity = JuryMember(**data)
        return await self.jury_member_repository.save(jury_member_entity)

    async def delete_jury_member(self, jury_member_id: int):
        return await self.jury_member_repository.delete(jury_member_id)