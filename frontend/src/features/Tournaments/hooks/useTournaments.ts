import { useQuery } from "@tanstack/react-query";
import { getTournaments } from "../../../services/api";
import type { Tournament } from "../../../services/api";

export const tournamentsKeys = {
  all: ["tournaments"] as const,
  list: () => [...tournamentsKeys.all, "list"] as const,
};

function filterAndSortTournaments(data: Tournament[]): Tournament[] {
  const now = new Date();

  const activeAndUpcoming = data.filter((t) => {
    if (t.status === "Draft" || t.status === "Finished") return false;
    if (t.status === "Running") return true;
    const regEndDate = new Date(t.registration_end_date);
    return now <= regEndDate;
  });

  return activeAndUpcoming.sort((a, b) => {
    const aIsRunning = a.status === "Running";
    const bIsRunning = b.status === "Running";

    if (aIsRunning && !bIsRunning) return -1;
    if (!aIsRunning && bIsRunning) return 1;

    if (aIsRunning && bIsRunning) {
      return (
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      );
    }

    return (
      new Date(a.registration_end_date).getTime() -
      new Date(b.registration_end_date).getTime()
    );
  });
}

export function useTournaments() {
  return useQuery({
    queryKey: tournamentsKeys.list(),
    queryFn: getTournaments,
    select: filterAndSortTournaments,
  });
}