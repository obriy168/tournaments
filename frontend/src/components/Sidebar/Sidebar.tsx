import { NavLink, useNavigate } from "react-router-dom";
import { useAuth, type UserRole } from "../../features/auth/context/AuthContext";
import styles from "./Sidebar.module.css";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (!user) return null;

  const links = getLinksByRole(user.role);

  return (
    <aside className={styles.sidebar}>
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
            end={link.to === "/app/admin" || link.to === "/app/jury" || link.to === "/app/participant"}
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
        <button onClick={handleLogout} className={`${styles.link} ${styles.linkDanger}`}>
          Log out
        </button>
      </div>
    </aside>
  );
}

function getLinksByRole(role: UserRole) {
  switch (role) {
    case "admin":
      return [
        { to: "/app/admin", label: "Dashboard" },
        { to: "/app/admin/tournaments", label: "Tournaments" },
        { to: "/app/admin/teams", label: "Teams" },
        { to: "/app/admin/jury", label: "Jury" },
      ];
    case "jury":
      return [
        { to: "/app/jury", label: "Dashboard" },
        { to: "/app/jury/assignments", label: "Assignments" },
        { to: "/app/jury/evaluation", label: "Evaluation" },
      ];
    case "participant":
      return [
        { to: "/app/participant", label: "Dashboard" },
        { to: "/app/participant/team", label: "My Team" },
        { to: "/app/participant/submissions", label: "Submissions" },
      ];
    default:
      return [];
  }
}