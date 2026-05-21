import { useQuery } from "@tanstack/react-query";
import {
  getTournaments,
  getTournamentsPaginated,
  searchTournaments,
  type Tournament,
} from "@/services/api";
import { usePagination } from "@/hooks/usePagination";

export const tournamentsKeys = {
  all: ["tournaments"] as const,
  list: () => [...tournamentsKeys.all, "list"] as const,
};

export function useTournaments() {
  return useQuery({
    queryKey: tournamentsKeys.list(),
    queryFn: getTournaments,
  });
}

export function useTournamentsPaginated(
  searchText?: string,
  status?: Tournament["status"]
) {
  return usePagination<Tournament>({
    queryKey: tournamentsKeys.all,
    fetchFn: (params) =>
      searchText?.trim() || status
        ? searchTournaments(searchText, status, params)
        : getTournamentsPaginated(params),
    enabled: true,
    extraDeps: [searchText, status],
  });
}