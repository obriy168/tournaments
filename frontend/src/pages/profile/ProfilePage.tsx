import { useAuth } from "@/features/auth/hooks/useAuth";
import { useMyTeams } from "@/features/teams/hooks/useMyTeams";
import { useQuery } from "@tanstack/react-query";
import { getTournament } from "@/services/api";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useTranslation } from "react-i18next";
import styles from "./ProfilePage.module.css";

export default function ProfilePage() {
  const { user } = useAuth();
  const logout = useLogout();
  const { data: teams } = useMyTeams();
  const team = teams?.[0];
  const { t } = useTranslation();

  const { data: tournament } = useQuery({
    queryKey: ["tournament", team?.tournament_id],
    queryFn: () => getTournament(team!.tournament_id!),
    enabled: !!team?.tournament_id,
  });

  if (!user) {
    return (
      <div className={styles.container}>
        <p className={styles.loading}>{t("profilepage.loading")}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{t("profilepage.title")}</h1>
      <div className={styles.card}>
        <div className={styles.field}>
          <span className={styles.label}>{t("profilepage.name")}</span>
          <span className={styles.value}>
            {user.first_name} {user.last_name}
          </span>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>{t("profilepage.email")}</span>
          <span className={styles.value}>{user.email}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>{t("profilepage.role")}</span>
          <span className={`${styles.value} ${styles.role}`}>{user.role}</span>
        </div>
        {team && (
          <>
            <div className={styles.field}>
              <span className={styles.label}>{t("profilepage.team")}</span>
              <span className={styles.value}>{team.name}</span>
            </div>
            {tournament && (
              <div className={styles.field}>
                <span className={styles.label}>
                  {t("profilepage.tournament")}
                </span>
                <span className={styles.value}>{tournament.name}</span>
              </div>
            )}
          </>
        )}
        <button onClick={logout} className={styles.logout} type="button">
          {t("profilepage.logout")}
        </button>
      </div>
    </div>
  );
}