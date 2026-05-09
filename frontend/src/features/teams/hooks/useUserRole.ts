import { useQuery } from "@tanstack/react-query";
import { isUserLeader } from "@/services/api";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function useIsTeamLead(teamId: number) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["is-team-lead", teamId, user?.id],
    queryFn: () => {
      if (!user) return false;
      return isUserLeader(teamId, user.id);
    },
    enabled: !!user && !!teamId,
  });
}