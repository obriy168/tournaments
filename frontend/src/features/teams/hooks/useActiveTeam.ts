import { useMemo, useEffect } from "react";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useMyTeams } from "./useMyTeams";

export function useActiveTeam() {
  const activeTournamentId = useAuthStore((s) => s.activeTournamentId);
  const { data: teams, isLoading, refetch } = useMyTeams();

  useEffect(() => {
    if (activeTournamentId) {
      refetch();
    }
  }, [activeTournamentId, refetch]);

  const team = useMemo(() => {
    if (!teams || !activeTournamentId) return null;
    return teams.find((t) => t.tournament_id === activeTournamentId) || null;
  }, [teams, activeTournamentId]);

  const hasAnyTeam = useMemo(() => {
    return !!teams && teams.length > 0;
  }, [teams]);

  const hasTeam = !!team;
  const isReallyLoading = isLoading;

  return { 
    team, 
    isLoading: isReallyLoading, 
    hasTeam,
    hasAnyTeam,
    allTeams: teams || []
  };
}