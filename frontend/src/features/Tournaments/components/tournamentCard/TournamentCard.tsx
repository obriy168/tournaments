import { Link } from "react-router-dom";
import type { Tournament } from "../../../../services/api";
import styles from "./TournamentCard.module.css";

interface Props {
  tournament: Tournament;
}

export default function TournamentCard({ tournament }: Props) {
  const isOpen = tournament.status === "Registration";

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>{tournament.name}</h3>
      <p className={styles.description}>{tournament.description}</p>
      
      <div className={styles.info}>
        <span className={`${styles.status} ${isOpen ? styles.statusOpen : ""}`}>
          <span className={styles.dot}></span>
          {isOpen ? "Registration Open" : tournament.status}
        </span>
        <span className={styles.date}>
          {formatDate(tournament.start_date)} - {formatDate(tournament.registration_end_date)}
        </span>
      </div>
      
      <Link 
        to="/login" 
        className={styles.button}
      >
        Join Tournament
      </Link>
    </div>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}