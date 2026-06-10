from typing import Annotated

from fastapi import Depends

from database.schemas.schema import UserRole
from repositories.user_role_repository import UserRoleRepository
from services.models.user_role_model import UserRoleModel

class UserRoleService:
    def __init__(self, user_role_repository: Annotated[UserRoleRepository, Depends(UserRoleRepository)]):
        self.user_role_repository = user_role_repository

    async def get_role_by_user_id(self, user_id: int, tournament_id: int):
        role = await self.user_role_repository.get_role_by_user_id(user_id, tournament_id)
        if role is None:
            return None
        return role
    
    async def set_user_role(self, user: UserRoleModel) -> UserRole:
        data = user.model_dump(exclude={"id"})
        user_entity = UserRole(**data)
        return await self.user_role_repository.save(user_entity)
    
    async def get_users_by_role_name(self, role_name: str, tournament_id: int):
        return await self.user_role_repository.get_users_by_role_name(role_name, tournament_id)
    
    async def get_all_userroles(self, user_id: int):
        return await self.user_role_repository.get_all_userroles(user_id)