import { useNavigate } from "react-router-dom";
import { useAdminStats } from "@/features/admin/hooks/useAdminStats";
import styles from "./AdminDashboard.module.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useAdminStats();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Admin Dashboard</h1>
          <p className={styles.subtitle}>Platform overview and quick actions</p>
        </div>
      </header>

      <div className={styles.content}>
        {isLoading ? (
          <div className={styles.loading}>Loading statistics…</div>
        ) : (
          <>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <span className={styles.statValue}>{stats?.totalTournaments ?? 0}</span>
                <span className={styles.statLabel}>Total Tournaments</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statValue}>{stats?.activeTournaments ?? 0}</span>
                <span className={styles.statLabel}>Active Now</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statValue}>{stats?.registrationOpen ?? 0}</span>
                <span className={styles.statLabel}>Open Registration</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statValue}>{stats?.totalTeams ?? 0}</span>
                <span className={styles.statLabel}>Total Teams</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statValue}>{stats?.totalUsers ?? 0}</span>
                <span className={styles.statLabel}>Total Users</span>
              </div>
            </div>

            <div className={styles.actionsSection}>
              <h2 className={styles.sectionTitle}>Quick Actions</h2>
              <div className={styles.actionsGrid}>
                <button
                  className={styles.actionCard}
                  onClick={() => navigate("/app/admin/tournaments")}
                >
                  <div className={styles.actionIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <span className={styles.actionLabel}>Manage Tournaments</span>
                </button>
                <button
                  className={styles.actionCard}
                  onClick={() => navigate("/app/admin/teams")}
                >
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
                <button
                  className={styles.actionCard}
                  onClick={() => navigate("/app/admin/rounds")}
                >
                  <div className={styles.actionIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                  </div>
                  <span className={styles.actionLabel}>Manage Rounds</span>
                </button>
                <button
                  className={styles.actionCard}
                  onClick={() => navigate("/app/admin/jury")}
                >
                  <div className={styles.actionIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                    </svg>
                  </div>
                  <span className={styles.actionLabel}>Manage Jury</span>
                </button>
                <button
                  className={styles.actionCard}
                  onClick={() => navigate("/app/admin/tasks")}
                >
                  <div className={styles.actionIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 11l3 3L22 4" />
                      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                    </svg>
                  </div>
                  <span className={styles.actionLabel}>Manage Tasks</span>
                </button>
                <button
                  className={styles.actionCard}
                  onClick={() => navigate("/app/admin/submissions")}
                >
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
          </>
        )}
      </div>
    </div>
  );
}