import math

from typing import Annotated

from fastapi import Depends

from pwdlib import PasswordHash

from database.schemas.schema import User
from repositories.user_repository import UserRepository
from repositories.user_role_repository import UserRoleRepository
from services.errors.user_existed import UserExistedException
from services.models.pagination_model import PaginationModel
from services.models.user_model import UserModel

class UserService:
    def __init__(self, user_repository: Annotated[UserRepository, Depends(UserRepository)], user_role_repository: Annotated[UserRoleRepository, Depends(UserRoleRepository)]):
        self.user_repository = user_repository
        self.user_role_repository = user_role_repository

    async def get_user_by_id(self, user_id: int):
        return await self.user_repository.get_by_id(user_id)
    
    async def get_user_by_email(self, email: str) -> User | None:
        return await self.user_repository.get_user_by_email(email)

    async def get_all_users(self):
        return await self.user_repository.get_all()
    
    async def get_all_users_pagination(self, pagination: PaginationModel):
        users, total_count = await self.user_repository.get_all_paginated(limit=pagination.limit, offset=pagination.offset)
        
        return {
            "items": users,
            "meta": {
                "page": pagination.page,
                "page_size": pagination.limit,
                "total": total_count,
                "pages": math.ceil(total_count / pagination.limit)
            }
        }
    
    async def search_users(self, text: str | None, pagination: PaginationModel):
        users, total_count = await self.user_repository.get_filtered_paginated(
            search_text=text, limit=pagination.limit, offset=pagination.offset, search_fields=[User.first_name, User.last_name, User.email])
        
        return {
            "items": users,
            "meta": {
                "page": pagination.page,
                "page_size": pagination.limit,
                "total": total_count,
                "pages": math.ceil(total_count / pagination.limit)
            }
        }
    
    async def create_user(self, user: UserModel) -> User:

        existing_user = await self.user_repository.get_user_by_email(user.email)
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
        user = await self.user_repository.get_user_by_email(email)

        password_hash = PasswordHash(hashers=["argon2"]).recommended()

        if user and password_hash.verify(password, user.password):
            return user
        return None