import { useQuery } from "@tanstack/react-query";
import { getTournaments } from "@/services/api";

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