import { useQuery } from "@tanstack/react-query";
import { getTournaments, getTeams, getUsers } from "@/services/api";

export const adminStatsKeys = {
  all: ["admin-stats"] as const,
};

export function useAdminStats() {
  return useQuery({
    queryKey: adminStatsKeys.all,
    queryFn: async () => {
      const [tournaments, teams, users] = await Promise.all([
        getTournaments(),
        getTeams(),
        getUsers(),
      ]);
      return {
        totalTournaments: tournaments.length,
        totalTeams: teams.length,
        totalUsers: users.length,
        activeTournaments: tournaments.filter((t) => t.status === "Running").length,
        registrationOpen: tournaments.filter((t) => t.status === "Registration").length,
      };
    },
    enabled: true,
  });
}