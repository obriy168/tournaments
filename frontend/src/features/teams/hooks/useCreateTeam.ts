import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTeam, addUserToTeam, changeTeamLeader } from "@/services/api";
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
  verifiedMembers?: TeamMember[];
  pendingMembers?: TeamMember[];
}

export function useCreateTeam() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const checkTeam = useAuthStore((s) => s.checkTeam);

  return useMutation({
    mutationFn: async (data: CreateTeamPayload) => {
      if (!user) throw new Error("Not authenticated");

      const { verifiedMembers, pendingMembers, ...teamData } = data;

      if (!teamData.tournament_id) {
        throw new Error("Tournament is required");
      }

      const team = await createTeam({
        name: teamData.name,
        city: teamData.city,
        organization: teamData.organization,
        tournament_id: teamData.tournament_id,
      });

      await addUserToTeam(team.id, user.id);
      await changeTeamLeader(team.id, user.id);

      if (verifiedMembers && verifiedMembers.length > 0) {
        await Promise.all(
          verifiedMembers
            .filter((member) => member.userId && member.userId !== user.id)
            .map((member) =>
              addUserToTeam(team.id, member.userId!).catch((err) => {
                console.error(`Failed to add user ${member.email}:`, err);
              })
            )
        );
      }

      if (pendingMembers && pendingMembers.length > 0) {
        const allInvites = JSON.parse(
          localStorage.getItem("pending_team_invites") || "[]"
        ) as Array<{ email: string; teamId: number; teamName: string; invitedAt: string }>;

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myTeamsKeys.all });
      checkTeam();
    },
  });
}