from repositories.user_role_repository import UserRoleRepository
from services.errors.user_existed import UserExistedException
from repositories.user_repository import UserRepository
from database.schemas.schema import User
from services.models.user_model import UserModel
from typing import Annotated
from fastapi import Depends
from pwdlib import PasswordHash

class UserService:
    def __init__(self, user_repository: Annotated[UserRepository, Depends(UserRepository)], user_role_repository: Annotated[UserRoleRepository, Depends(UserRoleRepository)]):
        self.user_repository = user_repository
        self.user_role_repository = user_role_repository

    async def get_user_by_id(self, user_id: int):
        return await self.user_repository.get_by_id(user_id)
    
    
    async def get_all_users(self):
        return await self.user_repository.get_all()
    
    async def create_user(self, user: UserModel) -> User:

        existing_user = await self.user_repository.get_by_email(user.email)
        if existing_user:
            raise UserExistedException(email=user.email)

        data = user.model_dump(exclude={"id"})
        user_entity = User(**data)

        password_hash = PasswordHash(hashers=["argon2"]).recommended()

        user_entity.password = password_hash.hash(user_entity.password)
        
        user = await self.user_repository.save(user_entity)

        # We should assign admin role to the first user in the system
        # Think about this
        # if await self.user_repository.users_count() == 1:
        #     await self.user_role_repository.save({"user_id": user.id, "role": "admin", "tournament_id": None})
        #     await self.user_repository.update(user.id, user)

        return user
        

    async def delete_user(self, user_id: int):
        return await self.user_repository.delete(user_id)
    
    async def login(self, email: str, password: str):
        user = await self.user_repository.get_by_email(email)

        password_hash = PasswordHash(hashers=["argon2"]).recommended()

        if user and password_hash.verify(password, user.password):
            return user
        return None
