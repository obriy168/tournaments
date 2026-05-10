import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeUserFromTeamByIds } from "@/services/api";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { myTeamsKeys } from "./useMyTeams";
import { useAuthStore } from "@/features/auth/store/authStore";

export function useLeaveTeam() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const checkTeam = useAuthStore((s) => s.checkTeam);

  return useMutation({
    mutationFn: async (teamId: number) => {
      if (!user) throw new Error("Not authenticated");
      await removeUserFromTeamByIds(user.id, teamId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myTeamsKeys.all });
      checkTeam();
    },
  });
}