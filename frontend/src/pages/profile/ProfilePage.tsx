import { useAuth } from "../../features/auth/context/AuthContext";
import { useNavigate } from "react-router-dom";
import styles from "./ProfilePage.module.css";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (!user) return null;

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
        <button onClick={handleLogout} className={styles.logout}>
          Log out
        </button>
      </div>
    </div>
  );
}