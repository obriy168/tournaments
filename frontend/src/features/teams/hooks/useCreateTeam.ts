import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTeam } from "@/services/api";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useAuthStore } from "@/features/auth/store/authStore";
import { myTeamsKeys } from "./useMyTeams";

export interface TeamMember {
  id: number;
  fullName: string;
  email: string;
  userId?: number;
  isLead: boolean;
}

interface CreateTeamPayload {
  name: string;
  city: string;
  organization: string;
  tournament_id: number;
  captain_phone?: string;
  captain_contact?: string;
  verifiedMembers?: TeamMember[];
  pendingMembers?: TeamMember[];
}

function clearCreateTeamStorage() {
  sessionStorage.removeItem("createTeam_step1");
  sessionStorage.removeItem("createTeam_verifiedMembers");
  sessionStorage.removeItem("createTeam_pendingMembers");
  localStorage.removeItem("pending_team_invites");
}

export function useCreateTeam() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const checkTeam = useAuthStore((s) => s.checkTeam);
  const setActiveTournament = useAuthStore((s) => s.setActiveTournament);

  return useMutation({
    mutationFn: async (data: CreateTeamPayload) => {
      if (!user) throw new Error("Not authenticated");

      const { verifiedMembers, pendingMembers, ...teamData } = data;

      if (!teamData.tournament_id) {
        throw new Error("Tournament is required");
      }

      const userTeams = [
        {
          user_id: user.id,
          is_lead: true,
        },
      ];

      if (verifiedMembers && verifiedMembers.length > 0) {
        const validMembers = verifiedMembers.filter(
          (member) => member.userId && member.userId !== user.id
        );

        for (const member of validMembers) {
          userTeams.push({
            user_id: member.userId!,
            is_lead: false,
          });
        }
      }

      const team = await createTeam({
        name: teamData.name,
        city: teamData.city,
        organization: teamData.organization,
        tournament_id: teamData.tournament_id,
        user_teams: userTeams,
      });

      if (pendingMembers && pendingMembers.length > 0) {
        const allInvites = JSON.parse(
          localStorage.getItem("pending_team_invites") || "[]"
        ) as Array<{
          email: string;
          teamId: number;
          teamName: string;
          invitedAt: string;
        }>;

        for (const member of pendingMembers) {
          allInvites.push({
            email: member.email,
            teamId: team.id,
            teamName: team.name,
            invitedAt: new Date().toISOString(),
          });
        }
        localStorage.setItem("pending_team_invites", JSON.stringify(allInvites));
      }

      return team;
    },
    onSuccess: async (team) => {
      clearCreateTeamStorage();
      
      await queryClient.invalidateQueries({ queryKey: myTeamsKeys.all });
      if (user) {
        await queryClient.refetchQueries({ 
          queryKey: myTeamsKeys.list(user.id),
          exact: true
        });
      }
      
      if (team.tournament_id) {
        setActiveTournament(team.tournament_id);
      }
      
      await checkTeam();
    },
    onError: () => {
      clearCreateTeamStorage();
    },
  });
}