import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registerTeamForTournament } from "@/services/api";
import { myTeamsKeys } from "@/features/teams/hooks/useMyTeams";

// TODO BACKEND: Эндпоинт PATCH /teams/{team_id}/tournament пока не реализован
export function useRegisterTeamForTournament() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ teamId, tournamentId }: { teamId: number; tournamentId: number }) => {
      return await registerTeamForTournament(teamId, tournamentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myTeamsKeys.all });
    },
  });
}