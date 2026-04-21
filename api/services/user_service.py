from repositories.user_repository import UserRepository
from database.schemas.schema import User
from services.models.user_model import UserModel
from typing import Annotated
from fastapi import Depends

class UserService:
    def __init__(self, user_repository: Annotated[UserRepository, Depends(UserRepository)]):
        self.user_repository = user_repository

    async def get_user_by_id(self, user_id: int):
        return await self.user_repository.get_user(user_id)
    
    async def create_user(self, user: UserModel) -> User:
        data = user.model_dump(exclude={"id"})
        user_entity = User(**data)
        return await self.user_repository.save_user(user_entity)
