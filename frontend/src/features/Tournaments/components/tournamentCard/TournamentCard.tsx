import { memo, useMemo } from "react";
import { Link } from "react-router-dom";
import type { Tournament } from "@/services/api";
import styles from "./TournamentCard.module.css";
import { useTranslation } from "react-i18next";

interface Props {
  tournament: Tournament;
  actionUrl?: string;
  actionLabel?: string;
  hideAction?: boolean;
}

function TournamentCard({
  tournament,
  actionUrl = "/login",
  actionLabel = "mainpage.hero.button",
  hideAction = false,
}: Props) {
  const { t } = useTranslation();
  const statusKey = tournament.status.toLowerCase();

  const dates = useMemo(() => {
    const fmt = (d: string) =>
      new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    return {
      regStart: tournament.registration_start_date
        ? fmt(tournament.registration_start_date)
        : null,
      regEnd: fmt(tournament.registration_end_date),
      start: fmt(tournament.start_date),
    };
  }, [
    tournament.registration_start_date,
    tournament.registration_end_date,
    tournament.start_date,
  ]);

  const statusTranslated = t(`mainpage.tournaments.status.${statusKey}`);

  return (
    <article className={styles.card}>
      <div className={styles.content}>
        <h3 className={styles.title}>{tournament.name}</h3>
        <p className={styles.description}>{tournament.description}</p>

        <div className={styles.info}>
          <span className={`${styles.status} ${styles[statusKey]}`}>
            <span className={styles.dot} aria-hidden="true" />
            {statusTranslated}
          </span>

          <dl className={styles.dates}>
            {dates.regStart && (
              <div className={styles.dateRow}>
                <dt className={styles.dateLabel}>
                  {t("mainpage.tournaments.dates.opens")}
                </dt>
                <dd className={styles.dateValue}>{dates.regStart}</dd>
              </div>
            )}
            <div className={styles.dateRow}>
              <dt className={styles.dateLabel}>
                {t("mainpage.tournaments.dates.closes")}
              </dt>
              <dd className={styles.dateValue}>{dates.regEnd}</dd>
            </div>
            <div className={styles.dateRow}>
              <dt className={styles.dateLabel}>
                {t("mainpage.tournaments.dates.starts")}
              </dt>
              <dd className={styles.dateValue}>{dates.start}</dd>
            </div>
          </dl>
        </div>
      </div>

      {!hideAction &&
        (tournament.status === "Registration" ? (
          <Link to={actionUrl} className={styles.button}>
            {t(actionLabel)}
          </Link>
        ) : (
          <span className={styles.closedBadge}>
            {tournament.status === "Running"
              ? t("mainpage.tournaments.registrationClosed")
              : t("mainpage.tournaments.finished")}
          </span>
        ))}
    </article>
  );
}

export default memo(TournamentCard);