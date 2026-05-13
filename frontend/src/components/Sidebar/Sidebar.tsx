import { NavLink } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useLogout } from "@/features/auth/hooks/useLogout";
import type { UserRole } from "@/features/auth/context/authContextValue";
import styles from "./Sidebar.module.css";

interface LinkItem {
  to: string;
  label: string;
  end: boolean;
}

export default function Sidebar() {
  const { user, hasTeam } = useAuth();
  const logout = useLogout();

  const links = user ? getLinksByRole(user.role, hasTeam) : [];

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
          onClick={logout}
          className={`${styles.link} ${styles.linkDanger}`}
          type="button"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}

function getLinksByRole(role: UserRole, hasTeam: boolean): LinkItem[] {
  switch (role) {
    case "admin":
      return [
        { to: "/app/admin", label: "Dashboard", end: true },
        { to: "/app/admin/tournaments", label: "Tournaments", end: false },
        // { to: "/app/admin/teams", label: "Teams", end: false },     // заглушка
        // { to: "/app/admin/jury", label: "Jury", end: false },       // заглушка
      ];
      case "organizer":
      return [
        { to: "/app/organizer", label: "Dashboard", end: true },
        { to: "/app/admin/tournaments", label: "Tournaments", end: false },
      ];
    case "jury":
      return [
        { to: "/app/jury", label: "Dashboard", end: true },
        // { to: "/app/jury/assignments", label: "Assignments", end: false },  // заглушка
        // { to: "/app/jury/evaluation", label: "Evaluation", end: false },    // заглушка
      ];
    case "participant":
      if (hasTeam) {
        return [
          { to: "/app/participant", label: "Dashboard", end: true },
          { to: "/app/participant/team", label: "My Team", end: false },
          { to: "/app/participant/tournament", label: "Tournament", end: false },
          { to: "/app/participant/submissions", label: "Submissions", end: false },
        ];
      }
      return [
        { to: "/app/participant", label: "Dashboard", end: true },
      ];
    case "captain":
      return [
        { to: "/app/participant", label: "Dashboard", end: true },
        { to: "/app/participant/team", label: "My Team", end: false },
        { to: "/app/participant/tournament", label: "Tournament", end: false },
        { to: "/app/participant/submissions", label: "Submissions", end: false },
      ];
    default:
      return [];
  }
}