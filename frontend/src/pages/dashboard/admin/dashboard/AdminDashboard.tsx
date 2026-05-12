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
                  onClick={() => navigate("/app/admin/jury")}
                >
                  <div className={styles.actionIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                    </svg>
                  </div>
                  <span className={styles.actionLabel}>Manage Jury</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}