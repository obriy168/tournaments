import { useAuth } from "@/features/auth/hooks/useAuth";
import { useLogout } from "@/features/auth/hooks/useLogout";
import styles from "./ProfilePage.module.css";

export default function ProfilePage() {
  const { user } = useAuth();
  const logout = useLogout();

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
          <span className={`${styles.value} ${styles.role}`}>{user.role}</span>
        </div>
        <button onClick={logout} className={styles.logout} type="button">
          Log out
        </button>
      </div>
    </div>
  );
}