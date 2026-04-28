import { Link } from "react-router-dom";
import { useTournaments } from "../../features/Tournaments/hooks/useTournaments";
import TournamentCard from "../../features/Tournaments/components/TournamentCard/TournamentCard";
import styles from "./MainPage.module.css";

export default function MainPage() {
  const { tournaments, isLoading, error } = useTournaments();

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.hero__container}>
          <h1 className={styles.hero__title}>Welcome to skyline</h1>
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

          {isLoading && (
            <div className={styles.loading}>Loading tournaments...</div>
          )}

          {error && (
            <div className={styles.error}>
              {error}
              <button onClick={() => window.location.reload()} className={styles.retry}>
                Retry
              </button>
            </div>
          )}

          {!isLoading && !error && tournaments.length === 0 && (
            <div className={styles.empty}>No active tournaments at the moment.</div>
          )}

          {!isLoading && !error && tournaments.length > 0 && (
            <div className={styles.tournaments__grid}>
              {tournaments.map((tournament) => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}