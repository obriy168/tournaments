from fastapi import Depends

from util.auth import validate_session
from routes.models.user_session import UserSession

from services.submission_service import SubmissionService

from util.access.helpers import (
    is_tournament_staff,
    forbidden,
    not_found
)

class SubmissionAccess:
    @staticmethod
    async def can_view_submission(submission_id: int,
                                  user: UserSession = Depends(validate_session),
                                  submission_service: SubmissionService = Depends(SubmissionService)):
        if user.is_admin: return user

        submission = await submission_service.get_submission_by_id_custom(submission_id)
        if not submission:
            not_found("Submission not found")

        is_member = await submission_service.check_user_in_team(user.user_id, submission.team_id)
        is_staff = is_tournament_staff(user, submission.task.tournament_id)


        if not is_member and not is_staff:
            forbidden("Forbidden: Not a team member or tournament staff")
        
        return user

    @staticmethod
    async def can_modify_submission(submission_id: int,
                                    user: UserSession = Depends(validate_session),
                                    submission_service: SubmissionService = Depends(SubmissionService)):
        if user.is_admin: return user

        submission = await submission_service.get_submission_by_id(submission_id)
        if not submission:
            not_found("Submission not found")

        is_member = await submission_service.check_user_in_team(user.user_id, submission.team_id)
        if not is_member:
            forbidden("Forbidden: Only team members can update this submission")
        
        return user