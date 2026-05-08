import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeUserFromTeam, getUserTeamLink } from "@/services/api";
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
      
      // TODO BACKEND: Нужен эндпоинт для получения user_team_id по team_id + user_id
      // Временное решение: получаем через отдельный запрос
      const link = await getUserTeamLink(teamId, user.id);
      if (!link) throw new Error("Team membership not found");
      
      await removeUserFromTeam(link.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myTeamsKeys.all });
      checkTeam();
    },
  });
}