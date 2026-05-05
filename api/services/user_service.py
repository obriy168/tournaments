from repositories.user_repository import UserRepository
from database.schemas.schema import User
from services.models.user_model import UserModel
from typing import Annotated
from fastapi import Depends
import util.security as security_utils

class UserService:
    def __init__(self, user_repository: Annotated[UserRepository, Depends(UserRepository)]):
        self.user_repository = user_repository

    async def get_user_by_id(self, user_id: int):
        return await self.user_repository.get_by_id(user_id)
    
    async def get_all_users(self):
        return await self.user_repository.get_all()
    
    async def create_user(self, user: UserModel) -> User:
        existing_user = await self.user_repository.get_user_by_email(user.email)
        if existing_user:
            return {"detail": "User with this email already exists"}
        
        data = user.model_dump(exclude={"id"})
        data["password"] = security_utils.get_hash_password(data["password"])
        user_entity = User(**data)
        return await self.user_repository.save(user_entity)
    
    async def authenticate_user(self, email: str, password: str) -> User | None:
        user = await self.user_repository.get_user_by_email(email)
        if user and security_utils.verify_password(password, user.password):
            return user
        return None

    async def delete_user(self, user_id: int):
        return await self.user_repository.delete(user_id)
