import { memo, useMemo } from "react";
import { Link } from "react-router-dom";
import type { Tournament } from "@/services/api";
import styles from "./TournamentCard.module.css";

interface Props {
  tournament: Tournament;
  actionUrl?: string;
  actionLabel?: string;
}

function TournamentCard({
  tournament,
  actionUrl = "/login",
  actionLabel = "Join Tournament",
}: Props) {
  const isOpen = tournament.status === "Registration";

  const dates = useMemo(() => {
    const fmt = (d: string) => new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return {
      regStart: tournament.registration_start_date ? fmt(tournament.registration_start_date) : null,
      regEnd: fmt(tournament.registration_end_date),
      start: fmt(tournament.start_date),
    };
  }, [tournament.registration_start_date, tournament.registration_end_date, tournament.start_date]);

  return (
    <article className={styles.card}>
      <h3 className={styles.title}>{tournament.name}</h3>
      <p className={styles.description}>{tournament.description}</p>

      <div className={styles.info}>
        <span className={`${styles.status} ${isOpen ? styles.statusOpen : ""}`}>
          <span className={styles.dot} aria-hidden="true" />
          {tournament.status}
        </span>

        <dl className={styles.dates}>
          {dates.regStart && (
            <div className={styles.dateRow}>
              <dt className={styles.dateLabel}>Registration opens</dt>
              <dd className={styles.dateValue}>{dates.regStart}</dd>
            </div>
          )}
          <div className={styles.dateRow}>
            <dt className={styles.dateLabel}>Registration closes</dt>
            <dd className={styles.dateValue}>{dates.regEnd}</dd>
          </div>
          <div className={styles.dateRow}>
            <dt className={styles.dateLabel}>Tournament starts</dt>
            <dd className={styles.dateValue}>{dates.start}</dd>
          </div>
        </dl>
      </div>

      <Link to={actionUrl} className={styles.button}>
        {actionLabel}
      </Link>
    </article>
  );
}

export default memo(TournamentCard);