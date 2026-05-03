import { Link, NavLink } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useLogout } from "@/features/auth/hooks/useLogout";
import styles from "./Header.module.css";

export default function Header() {
  const { user } = useAuth();
  const logout = useLogout();

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo} aria-label="Skyline homepage">
          Skyline
        </Link>

        <nav className={styles.nav} aria-label="User navigation">
          {user ? (
            <>
              <NavLink to="/app/profile" className={styles.link}>
                {user.first_name}
              </NavLink>
              <button
                onClick={logout}
                className={styles.linkOutlined}
                type="button"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/signup" className={styles.link}>
                Sign up
              </NavLink>
              <NavLink to="/login" className={styles.linkOutlined}>
                Log in
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}