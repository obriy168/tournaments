import { useQuery } from "@tanstack/react-query";
import { getTournaments } from "@/services/api";
import type { Tournament } from "@/services/api";

export const tournamentsKeys = {
  all: ["tournaments"] as const,
  list: () => [...tournamentsKeys.all, "list"] as const,
};

function filterAndSortTournaments(data: Tournament[]): Tournament[] {
  const now = new Date();

  const activeAndUpcoming = data.filter((t) => {
    if (t.status === "Draft" || t.status === "Finished") return false;
    if (t.status === "Running") return true;
    return now <= new Date(t.registration_end_date);
  });

  return activeAndUpcoming.sort((a, b) => {
    const aRunning = a.status === "Running";
    const bRunning = b.status === "Running";
    if (aRunning !== bRunning) return aRunning ? -1 : 1;
    if (aRunning) {
      return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
    }
    return new Date(a.registration_end_date).getTime() - new Date(b.registration_end_date).getTime();
  });
}

export function useTournaments() {
  return useQuery({
    queryKey: tournamentsKeys.list(),
    queryFn: getTournaments,
    select: filterAndSortTournaments,
  });
}