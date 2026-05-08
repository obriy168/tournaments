import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import styles from "./ParticipantDashboard.module.css";

export default function ParticipantDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Welcome</h1>
        <div className={styles.user}>
          <span className={styles.userName}>{user?.first_name || "User"}</span>
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.emptyState}>
          <div className={styles.icon}>
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
            </svg>
          </div>
          <h2 className={styles.emptyTitle}>No team yet</h2>
          <p className={styles.emptyText}>
            You haven't joined any team yet. Join a team or create your own!
          </p>
          <div className={styles.buttons}>
            <button
              onClick={() => navigate("/app/participant/join")}
              className={`${styles.button} ${styles.buttonPrimary}`}
            >
              Join team
            </button>
            <span className={styles.or}>or</span>
            <button
              onClick={() => navigate("/app/participant/team/create")}
              className={`${styles.button} ${styles.buttonSecondary}`}
            >
              Create team
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}