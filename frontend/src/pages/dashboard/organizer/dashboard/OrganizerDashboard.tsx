import { useNavigate } from "react-router-dom";
import { useOrganizerStats } from "@/features/organizer/hooks/useOrganizerState";
import { useAuthStore } from "@/features/auth/store/authStore";
import styles from "./OrganizerDashboard.module.css";

export default function OrganizerDashboard() {
  const navigate = useNavigate();
  const activeTournamentId = useAuthStore((s) => s.activeTournamentId);
  
  const { data: stats, isLoading } = useOrganizerStats(activeTournamentId ?? 0);

  if (!activeTournamentId) {
    return <div className={styles.loading}>Please select a tournament to see statistics.</div>;
  }

  if (isLoading) return <div className={styles.loading}>Loading tournament data...</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{stats?.tournamentName || "Organizer Dashboard"}</h1>
          <p className={styles.subtitle}>Current Status: <strong>{stats?.tournamentStatus}</strong></p>
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{stats?.totalTeams ?? 0}</span>
            <span className={styles.statLabel}>Registered Teams</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{stats?.totalTasks ?? 0}</span>
            <span className={styles.statLabel}>Total Tasks</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{stats?.activeTasksCount ?? 0}</span>
            <span className={styles.statLabel}>Active Tasks</span>
          </div>
        </div>

        <div className={styles.actionsSection}>
          <h2 className={styles.sectionTitle}>Tournament Management</h2>
          <div className={styles.actionsGrid}>
            <button
              className={styles.actionCard}
              onClick={() => navigate("/app/organizer/tournaments")}
            >
              <div className={styles.actionIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <span className={styles.actionLabel}>Manage Tournament</span>
            </button>
            <button className={styles.actionCard} onClick={() => navigate(`/app/organizer/teams`)}>
              <div className={styles.actionIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <span className={styles.actionLabel}>View Teams</span>
            </button>

            <button className={styles.actionCard} onClick={() => navigate(`/app/organizer/tasks`)}>
              <div className={styles.actionIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                </svg>
              </div>
              <span className={styles.actionLabel}>Manage Tasks</span>
            </button>

            <button className={styles.actionCard} onClick={() => navigate(`/app/organizer/submissions`)}>
              <div className={styles.actionIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                  </div>
              <span className={styles.actionLabel}>Review Submissions</span>
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}