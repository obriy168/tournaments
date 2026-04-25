from fastapi import APIRouter
from services.jury_member_service import JuryMemberService
from fastapi import Depends, HTTPException
from typing import Annotated
from services.models.jury_member_model import JuryMemberModel

jury_member_router = APIRouter(prefix="/jury_member", tags=["jury_member"])

@jury_member_router.get("/{jury_member_id}")
async def get_jury_member_by_id(jury_member_id : int, jury_member_service: Annotated[JuryMemberService, Depends(JuryMemberService)]):
    jury_member = await jury_member_service.get_jury_member_by_id(jury_member_id)
    if jury_member is None:
        raise HTTPException(status_code=404, detail="Jury member not found")
    return jury_member

@jury_member_router.post("/")
async def create_jury_member(jury_member: JuryMemberModel, jury_member_service: Annotated[JuryMemberService, Depends(JuryMemberService)]):
    return await jury_member_service.create_jury_member(jury_member)

@jury_member_router.delete("/{jury_member_id}")
async def delete_jury_member(jury_member_id : int, jury_member_service: Annotated[JuryMemberService, Depends(JuryMemberService)]):
    is_delete = await jury_member_service.delete_jury_member(jury_member_id)
    return is_delete