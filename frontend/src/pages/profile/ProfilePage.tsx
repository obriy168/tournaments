import { useAuth } from "@/features/auth/hooks/useAuth";
import { useMyTeams } from "@/features/teams/hooks/useMyTeams";
import { useQuery } from "@tanstack/react-query";
import { getTournament } from "@/services/api";
import { useLogout } from "@/features/auth/hooks/useLogout";
import styles from "./ProfilePage.module.css";

export default function ProfilePage() {
  const { user } = useAuth();
  const logout = useLogout();
  const { data: teams } = useMyTeams();
  const team = teams?.[0];

  const { data: tournament } = useQuery({
    queryKey: ["tournament", team?.tournament_id],
    queryFn: () => getTournament(team!.tournament_id!),
    enabled: !!team?.tournament_id,
  });

  if (!user) {
    return (
      <div className={styles.container}>
        <p className={styles.loading}>Loading profile…</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Profile</h1>
      <div className={styles.card}>
        <div className={styles.field}>
          <span className={styles.label}>Name</span>
          <span className={styles.value}>
            {user.first_name} {user.last_name}
          </span>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Email</span>
          <span className={styles.value}>{user.email}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Role</span>
          <span className={`${styles.value} ${styles.role}`}>
            {user.role}
          </span>
        </div>
        {team && (
          <>
            <div className={styles.field}>
              <span className={styles.label}>Team</span>
              <span className={styles.value}>{team.name}</span>
            </div>
            {tournament && (
              <div className={styles.field}>
                <span className={styles.label}>Tournament</span>
                <span className={styles.value}>{tournament.name}</span>
              </div>
            )}
          </>
        )}
        <button onClick={logout} className={styles.logout} type="button">
          Log out
        </button>
      </div>
    </div>
  );
}