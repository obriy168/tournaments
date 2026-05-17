import { useQuery } from "@tanstack/react-query";
import { getMyTeams } from "@/services/api";
import { useAuth } from "@/features/auth/hooks/useAuth";

export const myTeamsKeys = {
  all: ["my-teams"] as const,
  list: (userId: number) => [...myTeamsKeys.all, userId] as const,
};

export function useMyTeams() {
  const { user } = useAuth();

  return useQuery({
    queryKey: myTeamsKeys.list(user?.id ?? 0),
    queryFn: () => getMyTeams(user!.id),
    enabled: !!user,
    staleTime: 0,
    gcTime: 1000 * 60 * 5,
  });
}