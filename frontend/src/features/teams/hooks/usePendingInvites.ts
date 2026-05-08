import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";

export interface TeamInvite {
  email: string;
  teamId: number;
  teamName: string;
  invitedAt: string;
}

export function usePendingInvites() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["pending-invites", user?.email],
    queryFn: () => {
      if (!user?.email) return [] as TeamInvite[];
      const allInvites = JSON.parse(
        localStorage.getItem("pending_team_invites") || "[]"
      ) as TeamInvite[];
      return allInvites.filter(
        (i) => i.email.toLowerCase() === user.email.toLowerCase()
      );
    },
    enabled: !!user?.email,
  });
}