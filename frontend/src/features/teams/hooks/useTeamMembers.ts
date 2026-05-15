import { useQuery } from "@tanstack/react-query";
import { getTeamMembers } from "@/services/api";

export function useTeamMembers(teamId: number) {
  return useQuery({
    queryKey: ["team-members", teamId],
    queryFn: () => getTeamMembers(teamId),
    enabled: !!teamId,
  });
}