from fastapi import Depends

from routes.models.user_session import UserSession
from util.auth import validate_session

from util.access.helpers import (
    is_tournament_organizer,
    forbidden
)

class TournamentAccess:
    @staticmethod
    async def as_organizer(tournament_id: int, 
                           user: UserSession = Depends(validate_session)):
        if user.is_admin: return user

        if not is_tournament_organizer(user, tournament_id):
            raise forbidden("You are not an organizer of this tournament.")
        return user