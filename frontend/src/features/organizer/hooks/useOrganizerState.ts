import { useQuery } from "@tanstack/react-query";
import { getTournament, getTeamsByTournament, getTasks } from "@/services/api";

export const organizerStatsKeys = {
  all: ["organizer-stats"] as const,
  byUser: (userId: number) => ["organizer-stats", userId] as const,
};

export function useOrganizerStats(tournamentId: number) {
  return useQuery({
    queryKey: ["organizer-stats", tournamentId],
    queryFn: async () => {
      const [tournament, teams, tasks] = await Promise.all([
        getTournament(tournamentId),
        getTeamsByTournament(tournamentId),
        getTasks(tournamentId),
      ]);

      return {
        tournamentName: tournament.name,
        tournamentStatus: tournament.status,
        totalTeams: teams.length,
        totalTasks: tasks.length,
        activeTasksCount: tasks.filter(t => t.status === "Active").length,
      };
    },
    enabled: !!tournamentId,
  });
}