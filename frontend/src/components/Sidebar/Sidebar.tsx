import { NavLink, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useAuth } from "../../features/auth/hooks/useAuth";
import type { UserRole } from "../../features/auth/context/authContextValue";
import styles from "./Sidebar.module.css";

interface LinkItem {
  to: string;
  label: string;
  end: boolean;
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const links = useMemo(() => {
    if (!user) return [];
    return getLinksByRole(user.role);
  }, [user]);

  if (!user) return null;

  return (
    <aside className={styles.sidebar} aria-label="Main navigation">
      <div className={styles.header}>
        <NavLink to="/app" className={styles.logo}>
          Skyline
        </NavLink>
      </div>

      <nav className={styles.nav}>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              isActive ? `${styles.link} ${styles.linkCurrent}` : styles.link
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className={styles.footer}>
        <NavLink
          to="/app/profile"
          className={({ isActive }) =>
            isActive ? `${styles.link} ${styles.linkCurrent}` : styles.link
          }
        >
          Profile
        </NavLink>
        <button
          onClick={handleLogout}
          className={`${styles.link} ${styles.linkDanger}`}
          type="button"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}

function getLinksByRole(role: UserRole): LinkItem[] {
  switch (role) {
    case "admin":
      return [
        { to: "/app/admin", label: "Dashboard", end: true },
        { to: "/app/admin/tournaments", label: "Tournaments", end: false },
        { to: "/app/admin/teams", label: "Teams", end: false },
        { to: "/app/admin/jury", label: "Jury", end: false },
      ];
    case "jury":
      return [
        { to: "/app/jury", label: "Dashboard", end: true },
        { to: "/app/jury/assignments", label: "Assignments", end: false },
        { to: "/app/jury/evaluation", label: "Evaluation", end: false },
      ];
    case "participant":
    case "captain":
      return [
        { to: "/app/participant", label: "Dashboard", end: true },
        { to: "/app/participant/team", label: "My Team", end: false },
        { to: "/app/participant/submissions", label: "Submissions", end: false },
      ];
    default:
      return [];
  }
}