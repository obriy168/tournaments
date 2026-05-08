import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import styles from "./JoinTournamentPage.module.css";

export default function JoinTournamentPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Ooops..</h1>
        <div className={styles.user}>
          <span className={styles.userName}>{user?.first_name || "User"}</span>
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.emptyState}>
          <div className={styles.icon}>
            <span style={{ fontSize: "75px", lineHeight: 1 }}>:(</span>
          </div>
          <h2 className={styles.emptyTitle}>
            Unfortunately, this feature is still under development...
          </h2>
          <p className={styles.emptyText}>But we're working on it!</p>
          <div className={styles.buttons}>
            <button
              onClick={() => navigate("/app/participant")}
              className={`${styles.button} ${styles.buttonPrimary}`}
            >
              Go back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}