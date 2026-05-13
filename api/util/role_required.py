from fastapi import Depends, HTTPException

from routes.models.user_session import UserSession
from util.auth import validate_session
from enums.role_enum import RoleEnum

from services.task_service import TaskService
from services.teams_service import TeamsService
from services.user_team_service import UserTeamService
from services.requirement_group_service import RequirementGroupService
from services.requirement_service import RequirementService
from services.evaluation_service import EvaluationService
from services.task_assigment_service import TaskAssignmentService
from services.submission_service import SubmissionService

def is_tournament_organizer(user: UserSession, tournament_id: int) -> bool:
    return any(
        role.tournament_id == tournament_id
        and role.role == RoleEnum.ORGANIZER
        for role in user.roles
    )

class RoleRequired:
    def __init__(self, target_roles: list[RoleEnum]):
        self.target_roles = target_roles

    def __call__(self, user: UserSession = Depends(validate_session)):
        user_roles = [role.role for role in user.roles]
        if not any(role in self.target_roles for role in user_roles):
             raise HTTPException(status_code=403, detail="Forbidden: you are not allowed to access this resource.")

        return user

class TournamentAccess:
    @staticmethod
    async def as_organizer(tournament_id: int, 
                           user: UserSession = Depends(validate_session)):
        if user.is_admin: return user

        if not is_tournament_organizer(user, tournament_id):
            raise HTTPException(status_code=403, detail="Forbidden: you are not an organizer of this tournament.")
        return user

class TaskAccess:
    @staticmethod
    async def as_organizer(task_id: int,
                           user: UserSession = Depends(validate_session),
                           task_service: TaskService = Depends(TaskService)):
        if user.is_admin: return user

        task = await task_service.get_task_by_id(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        if not is_tournament_organizer(user, task.tournament_id):
            raise HTTPException(status_code=403, detail="Forbidden: Only tournament organizers can manage this task.")
        return user
    
    @staticmethod
    async def as_tournament_organizer(tournament_id: int,
                                      user: UserSession = Depends(validate_session)):
        if user.is_admin: return user
        
        if not is_tournament_organizer(user, tournament_id):
            raise HTTPException(status_code=403, detail="Forbidden: You are not an organizer of this tournament")
        return user

class AssignmentAccess:
    @staticmethod
    async def can_view_or_modify(task_assignment_id: int,
                                 user: UserSession = Depends(validate_session),
                                 task_assignment_service: TaskAssignmentService = Depends(TaskAssignmentService),
                                 submission_service: SubmissionService = Depends(SubmissionService)):
        if user.is_admin: return user

        assignment = await task_assignment_service.get_task_assignment_by_id(task_assignment_id)
        if not assignment:
            raise HTTPException(status_code=404, detail="Task assignment not found")

        if assignment.evaluator_id == user.user_id:
            return user

        submission = await submission_service.get_submission_by_id_custom(assignment.submission_id)

        if not is_tournament_organizer(user, submission.task.tournament_id):
            raise HTTPException(status_code=403, detail="Forbidden")
            
        return user

    @staticmethod
    async def as_evaluator(task_assignment_id: int,
                           user: UserSession = Depends(validate_session),
                           task_assignment_service: TaskAssignmentService = Depends(TaskAssignmentService)):
        if user.is_admin: return user
        
        assignment = await task_assignment_service.get_task_assignment_by_id(task_assignment_id)
        if not assignment: 
            raise HTTPException(status_code=404, detail="Not found")
            
        if assignment.evaluator_id != user.user_id:
            raise HTTPException(status_code=403, detail="Forbidden: You are not assigned to this task")
        return user

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
            raise HTTPException(status_code=404, detail="Team not found")
            
        if not is_tournament_organizer(user, team.tournament_id):
            return user
    
        raise HTTPException(status_code=403, detail="Forbidden: Not enough permissions to modify this team")
    
    @staticmethod
    async def can_modify_by_user_team_id(user_team_id: int,
                                    user: UserSession = Depends(validate_session),
                                    user_team_service: UserTeamService = Depends(UserTeamService),
                                    teams_service: TeamsService = Depends(TeamsService)):
        if user.is_admin: return user

        user_team_link = await user_team_service.get_user_team_by_id(user_team_id)
        if not user_team_link:
            raise HTTPException(status_code=404, detail="User-Team link not found")
        
        return await TeamAccess.can_modify_team(
            team_id=user_team_link.team_id, 
            user=user, 
            teams_service=teams_service, 
            user_team_service=user_team_service
        )
    
class RequirementGroupAccess:
    @staticmethod
    async def as_organizer(requirement_group_id: int, 
                           user: UserSession = Depends(validate_session),
                           requirement_group_service: RequirementGroupService = Depends(RequirementGroupService)):
        if user.is_admin: return user

        group = await requirement_group_service.get_requirement_group_by_id(requirement_group_id)
        if not group:
            raise HTTPException(status_code=404, detail="Requirement group not found")

        tournament_id = await requirement_group_service.get_tournament_id_by_task_id(group.task_id)

        if not is_tournament_organizer(user, tournament_id):
            raise HTTPException(status_code=403, detail="Forbidden: not organizer of this tournament")

        return user

    @staticmethod
    async def as_task_organizer(task_id: int,
                                user: UserSession = Depends(validate_session),
                                task_service: TaskService = Depends(TaskService)):
        if user.is_admin: return user

        task = await task_service.get_task_by_id(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        if not is_tournament_organizer(user, task.tournament_id):
            raise HTTPException(status_code=403, detail="Forbidden: you are not an organizer of this tournament")
        return user

class RequirementAccess:
    @staticmethod
    async def as_organizer(requirement_id: int,
                           user: UserSession = Depends(validate_session),
                           requirement_service: RequirementService = Depends(RequirementService),
                           requirement_group_service: RequirementGroupService = Depends(RequirementGroupService),
                           task_service: TaskService = Depends(TaskService)):
        if user.is_admin: return user

        requirement = await requirement_service.get_requirement_by_id(requirement_id)
        if not requirement:
            raise HTTPException(status_code=404, detail="Requirement not found")

        group = await requirement_group_service.get_requirement_group_by_id(requirement.requirement_group_id)
        if not group:
            raise HTTPException(status_code=404, detail="Requirement group not found")

        task = await task_service.get_task_by_id(group.task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        if not is_tournament_organizer(user, task.tournament_id):
            raise HTTPException(status_code=403, detail="Forbidden")

        return user
    
    @staticmethod
    async def as_group_organizer(requirement_group_id: int,
                                 user: UserSession = Depends(validate_session),
                                 requirement_group_service: RequirementGroupService = Depends(RequirementGroupService),
                                 task_service: TaskService = Depends(TaskService)):
        if user.is_admin: return user

        group = await requirement_group_service.get_requirement_group_by_id(requirement_group_id)
        if not group:
            raise HTTPException(status_code=404, detail="Requirement group not found")

        task = await task_service.get_task_by_id(group.task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        if not is_tournament_organizer(user, task.tournament_id):
            raise HTTPException(status_code=403, detail="Forbidden: You are not an organizer")
        
        return user
    
class EvaluationAccess:
    @staticmethod
    async def can_modify_evaluation(evaluation_id: int,
                                  user: UserSession = Depends(validate_session),
                                  evaluation_service: EvaluationService = Depends(EvaluationService)):
        if user.is_admin: return user

        is_owner = await evaluation_service.check_evaluation_ownership(evaluation_id, user.user_id)
        if not is_owner:
            raise HTTPException(status_code=403, detail="Forbidden: You can only edit your own evaluations")
        return user

    @staticmethod
    async def as_jury_of_tournament(task_assignment_id: int,
                                    user: UserSession = Depends(validate_session),
                                    assignment_service: TaskAssignmentService = Depends(TaskAssignmentService)):
        if user.is_admin: return user

        task_assignment = await assignment_service.get_task_assignment_by_id(task_assignment_id)
        if not task_assignment:
            raise HTTPException(status_code=404, detail="Task assignment not found")

        if task_assignment.evaluator_id != user.user_id:
            raise HTTPException(status_code=403, detail="Forbidden: You are not a jury member in this tournament")
        
        return user

class SubmissionAccess:
    @staticmethod
    async def can_view_submission(submission_id: int,
                                  user: UserSession = Depends(validate_session),
                                  submission_service: SubmissionService = Depends(SubmissionService)):
        if user.is_admin: return user

        submission = await submission_service.get_submission_by_id_custom(submission_id)
        if not submission:
            raise HTTPException(status_code=404, detail="Submission not found")

        is_member = await submission_service.check_user_in_team(user.user_id, submission.team_id)
        is_staff = any(
            role.tournament_id == submission.task.tournament_id 
            and role.role in [RoleEnum.JURY, RoleEnum.ORGANIZER]
            for role in user.roles
        )

        if not is_member and not is_staff:
            raise HTTPException(status_code=403, detail="Forbidden: Not a team member or tournament staff")
        
        return user

    @staticmethod
    async def can_modify_submission(submission_id: int,
                                    user: UserSession = Depends(validate_session),
                                    submission_service: SubmissionService = Depends(SubmissionService)):
        if user.is_admin: return user

        submission = await submission_service.get_submission_by_id(submission_id)
        if not submission:
            raise HTTPException(status_code=404, detail="Submission not found")

        is_member = await submission_service.check_user_in_team(user.user_id, submission.team_id)
        if not is_member:
            raise HTTPException(status_code=403, detail="Forbidden: Only team members can update this submission")
        
        return user