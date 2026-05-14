from repositories.team_repository import TeamRepository
from services.user_team_service import UserTeamService
from database.schemas.schema import Team, UserTeam
from services.models.team_model import TeamModel, TeamRegistrationModel
from typing import Annotated
from fastapi import Depends

class TeamsService:
    def __init__(self, team_repository: Annotated[TeamRepository, Depends(TeamRepository)],
                       user_team_service: Annotated[UserTeamService, Depends(UserTeamService)]):
        self.team_repository = team_repository
        self.user_team_service = user_team_service

    async def get_team_by_id(self, team_id: int) -> Team:
        return await self.team_repository.get_by_id(team_id)

    async def get_all_teams(self):
        return await self.team_repository.get_all()
    
    async def create_team(self, team: TeamRegistrationModel) -> Team:
        data_team = team.model_dump(exclude={"id", "users_team"})

        team_entity = Team(**data_team)
        saved_team = await self.team_repository.create_team_without_commit(team_entity)

        if not saved_team:
            return None

        team_id = saved_team.id

        users_list = team.users_team

        entities_to_save: list[dict] = []
        for i in range(0, len(users_list)):
            users_list[i].team_id = team_id

            user_dict = users_list[i].model_dump(exclude={"id"})
            entities_to_save.append(user_dict)
        
        await self.user_team_service.bulk_save_users_team(entities_to_save)
        await self.team_repository.commit()
        return saved_team

    async def update_team(self, team_id: int, team: TeamModel) -> Team:
        db_team = await self.team_repository.get_by_id(team_id)

        if not db_team:
            return None
        new_team = team.model_dump(exclude_unset=True, exclude={"id"})

        db_team.sqlmodel_update(new_team)

        return await self.team_repository.save(db_team)

    async def delete_team(self, team_id: int) -> bool:
        return await self.team_repository.delete(team_id)

    async def get_teams_by_tournament_id(self, tournament_id: int) -> list[Team]:
        return await self.team_repository.get_teams_by_tournament_id(tournament_id)