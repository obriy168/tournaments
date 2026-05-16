import { useMemo } from "react";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useMyTeams } from "./useMyTeams";

export function useActiveTeam() {
  const activeTournamentId = useAuthStore((s) => s.activeTournamentId);
  const { data: teams, isLoading } = useMyTeams();

  const team = useMemo(() => {
    if (!teams || !activeTournamentId) return null;
    return teams.find((t) => t.tournament_id === activeTournamentId) || null;
  }, [teams, activeTournamentId]);

  return { team, isLoading, hasTeam: !!team };
}