import { memo } from "react";
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
          {tournament.registration_start_date && (
            <div className={styles.dateRow}>
              <dt className={styles.dateLabel}>Registration opens</dt>
              <dd className={styles.dateValue}>
                {formatDate(tournament.registration_start_date)}
              </dd>
            </div>
          )}
          <div className={styles.dateRow}>
            <dt className={styles.dateLabel}>Registration closes</dt>
            <dd className={styles.dateValue}>
              {formatDate(tournament.registration_end_date)}
            </dd>
          </div>
          <div className={styles.dateRow}>
            <dt className={styles.dateLabel}>Tournament starts</dt>
            <dd className={styles.dateValue}>
              {formatDate(tournament.start_date)}
            </dd>
          </div>
        </dl>
      </div>

      <Link to={actionUrl} className={styles.button}>
        {actionLabel}
      </Link>
    </article>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default memo(TournamentCard);