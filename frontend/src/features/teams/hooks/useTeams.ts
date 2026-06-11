import { usePagination } from "@/hooks/usePagination";
import { getTeamsPaginated, searchTeams, getTeamsByTournamentPaginated, type Team } from "@/services/api";

export const teamsKeys = {
  all: ["teams"] as const,
};

export function useTeamsPaginated(searchText?: string, tournamentId?: number | null) {
  return usePagination<Team>({
    queryKey: teamsKeys.all,
    fetchFn: (params) => {
      if (tournamentId) {
        return getTeamsByTournamentPaginated(tournamentId, params);
      }
      return searchText?.trim()
        ? searchTeams(searchText, params)
        : getTeamsPaginated(params);
    },
    enabled: true,
    extraDeps: [searchText, tournamentId],
  });
}