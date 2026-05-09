import { useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useTournaments } from "@/features/Tournaments/hooks/useTournaments";
import TournamentCard from "@/features/Tournaments/components/tournamentCard/TournamentCard";
import styles from "./MainPage.module.css";

export default function MainPage() {
  const { user, initializing } = useAuth();
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useTournaments();

  useEffect(() => {
    if (!initializing && user) {
      const rolePath = user.role === "captain" ? "participant" : user.role;
      navigate(`/app/${rolePath}`, { replace: true });
    }
  }, [user, initializing, navigate]);

  const content = useMemo(() => {
    if (isLoading) return <div className={styles.loading}>Loading tournaments…</div>;
    if (error) return (
      <div className={styles.error}>
        <p>{error.message}</p>
        <button onClick={() => refetch()} className={styles.retry}>Retry</button>
      </div>
    );
    if (!data || data.length === 0) return <div className={styles.empty}>No active tournaments at the moment.</div>;
    
    return (
      <div className={styles.tournaments__grid}>
        {data.map((tournament) => (
          <TournamentCard
            key={tournament.id}
            tournament={tournament}
            actionUrl="/login"
            actionLabel="Join Tournament"
          />
        ))}
      </div>
    );
  }, [isLoading, error, data, refetch]);

  if (initializing || user) return null;

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.hero__container}>
          <h1 className={styles.hero__title}>Welcome to Skyline</h1>
          <p className={styles.hero__description}>
            Join the world's most prestigious online programming tournaments.
          </p>
          <Link to="/login" className={styles.hero__button}>
            Join a Tournament
          </Link>
        </div>
      </section>

      <section className={styles.tournaments}>
        <div className={styles.tournaments__container}>
          <h2 className={styles.tournaments__title}>Active Tournaments</h2>
          <p className={styles.tournaments__description}>
            Check out the tournaments currently in progress.
          </p>
          <div className={styles.tournaments__content}>
            {content}
          </div>
        </div>
      </section>
    </>
  );
}