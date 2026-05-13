from fastapi import Depends

from util.auth import validate_session
from routes.models.user_session import UserSession

from services.teams_service import TeamsService
from services.user_team_service import UserTeamService

from util.access.helpers import (
    is_tournament_organizer,
    forbidden,
    not_found
)

class TeamAccess:
    @staticmethod
    async def can_modify_team(team_id: int,
                              user: UserSession = Depends(validate_session),
                              teams_service: TeamsService = Depends(TeamsService),
                              user_team_service: UserTeamService = Depends(UserTeamService)):
        if user.is_admin: return user

        is_leader = await user_team_service.is_user_leader(team_id, user.user_id)
        if is_leader:
            return user
    
        team = await teams_service.get_team_by_id(team_id)
        if not team:
            not_found("Team not found")
            
        if not is_tournament_organizer(user, team.tournament_id):
            forbidden("Not enough permissions to modify this team")
            
        return user
    
    @staticmethod
    async def can_modify_by_user_team_id(user_team_id: int,
                                    user: UserSession = Depends(validate_session),
                                    user_team_service: UserTeamService = Depends(UserTeamService),
                                    teams_service: TeamsService = Depends(TeamsService)):
        if user.is_admin: return user

        user_team_link = await user_team_service.get_user_team_by_id(user_team_id)
        if not user_team_link:
            not_found("User-Team link not found")
        
        return await TeamAccess.can_modify_team(
            team_id=user_team_link.team_id, 
            user=user, 
            teams_service=teams_service, 
            user_team_service=user_team_service
        )