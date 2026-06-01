import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useAuthStore } from "@/features/auth/store/authStore";
import { myTeamsKeys } from "@/features/teams/hooks/useMyTeams";
import styles from "./CreateTeam.module.css";

export default function CreateTeamSuccess() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const checkTeam = useAuthStore((s) => s.checkTeam);

  useEffect(() => {
    const refresh = async () => {
      await queryClient.invalidateQueries({ queryKey: myTeamsKeys.all });
      if (user) {
        await queryClient.refetchQueries({ 
          queryKey: myTeamsKeys.list(user.id),
          exact: true
        });
      }
      await checkTeam();
    };
    refresh();
  }, [queryClient, user, checkTeam]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Team creation</h1>
        <div className={styles.user}>
          <span className={styles.userName}>{user?.first_name || "User"}</span>
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.registration}>
          <div className={`${styles.registrationContent} ${styles.registrationContentCenter}`}>
            <div className={styles.success}>
              <div className={styles.successIcon}>
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h2 className={styles.successTitle}>Creation Successful!</h2>
              <p className={styles.successText}>
                Your team has been successfully created.
                <br />
                You can now manage your team from the dashboard.
              </p>
              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={() => navigate("/app/participant")}
              >
                Go to Team Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}