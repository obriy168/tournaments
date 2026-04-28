import type { Tournament } from "../../../services/api";
import { useState, useEffect } from "react";
import { getTournaments } from "../../../services/api";

interface UseTournamentsReturn {
  tournaments: Tournament[];
  isLoading: boolean;
  error: string | null;
}

export function useTournaments(): UseTournamentsReturn {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getTournaments();
        
        if (!cancelled) {
          const now = new Date();
          
          const activeAndUpcoming = data.filter((t) => {
            if (t.status === "Draft" || t.status === "Finished") return false;
            
            const startDate = new Date(t.start_date);
            const regEndDate = new Date(t.registration_end_date);

            return (t.status === "Running" && now <= regEndDate) || startDate > now;
          });
          
          const sorted = activeAndUpcoming.sort((a, b) => {
            const aIsRunning = a.status === "Running";
            const bIsRunning = b.status === "Running";
            
            if (aIsRunning && !bIsRunning) return -1;
            if (!aIsRunning && bIsRunning) return 1;
            
            return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
          });
          
          setTournaments(sorted);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.response?.data?.detail || "Failed to load tournaments");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetch();
    return () => { cancelled = true; };
  }, []);

  return { tournaments, isLoading, error };
}