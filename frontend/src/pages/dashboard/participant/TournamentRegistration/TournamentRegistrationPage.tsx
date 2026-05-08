import { useMemo, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useTournaments } from "@/features/Tournaments/hooks/useTournaments";
import { useRegisterTeamForTournament } from "@/features/Tournaments/hooks/useRegisterTeamForTournament";
import TournamentCard from "@/features/Tournaments/components/tournamentCard/TournamentCard";
import styles from "./TournamentRegistrationPage.module.css";

export default function TournamentRegistrationPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const teamId = searchParams.get("team");
  const { data: allTournaments, isLoading, error, refetch } = useTournaments();
  const registerMutation = useRegisterTeamForTournament();

  const tournaments = useMemo(() => {
    if (!allTournaments) return [];
    const now = new Date();
    
    return allTournaments
      .filter((t) => {
        if (t.status === "Draft" || t.status === "Finished") return false;
        if (t.status === "Running") return true;
        return now <= new Date(t.registration_end_date);
      })
      .sort((a, b) => {
        const aRunning = a.status === "Running";
        const bRunning = b.status === "Running";
        if (aRunning !== bRunning) return aRunning ? -1 : 1;
        if (aRunning) {
          return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
        }
        return new Date(a.registration_end_date).getTime() - new Date(b.registration_end_date).getTime();
      });
  }, [allTournaments]);

  const handleRegister = useCallback(async (tournamentId: number) => {
    if (!teamId) {
      alert("No team selected");
      return;
    }
    
    try {
      await registerMutation.mutateAsync({
        teamId: parseInt(teamId, 10),
        tournamentId,
      });
      navigate("/app/participant");
    } catch (err) {
      console.error("Failed to register:", err);
      alert("Failed to register for tournament. Please try again.");
    }
  }, [teamId, registerMutation, navigate]);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Available Tournaments</h1>
        </header>
        <p>Loading tournaments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Available Tournaments</h1>
        </header>
        <div className={styles.error}>
          <p>{error.message}</p>
          <button onClick={() => refetch()} className={styles.retry}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Available Tournaments</h1>
        <div className={styles.user}>
          <span className={styles.userName}>{user?.first_name || "User"}</span>
        </div>
      </header>

      <div className={styles.content}>
        {tournaments.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No active tournaments available for registration.</p>
            <button
              onClick={() => navigate("/app/participant")}
              className={`${styles.button} ${styles.buttonSecondary}`}
            >
              ← Back to Dashboard
            </button>
          </div>
        ) : (
          <>
            <p className={styles.subtitle}>
              Select a tournament to register your team
            </p>
            <div className={styles.tournamentsGrid}>
              {tournaments.map((tournament) => (
                <div key={tournament.id} className={styles.tournamentWrapper}>
                  <TournamentCard
                    tournament={tournament}
                    actionUrl="#"
                    actionLabel="View Details"
                  />
                  {tournament.status === "Registration" ? (
                    <button
                      onClick={() => handleRegister(tournament.id)}
                      className={styles.registerBtn}
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Registering..." : "Register Team"}
                    </button>
                  ) : (
                    <span className={styles.closedBadge}>Registration Closed</span>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}