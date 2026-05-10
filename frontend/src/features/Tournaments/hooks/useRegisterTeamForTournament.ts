import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registerTeamForTournament } from "@/services/api";
import { myTeamsKeys } from "@/features/teams/hooks/useMyTeams";

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