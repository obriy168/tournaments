import { useQuery } from "@tanstack/react-query";
import { getTeamMembers, type TeamMemberFull } from "@/services/api";

export function useTeamMembers(teamId: number) {
  return useQuery({
    queryKey: ["team-members", teamId],
    queryFn: async () => {
      try {
        return await getTeamMembers(teamId);
      } catch {
        return [] as TeamMemberFull[];
      }
    },
    enabled: !!teamId,
  });
}