// src/components/Header/Header.tsx
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import styles from "./Header.module.css";

export default function Header() {
  const { user, initializing } = useAuth();

  const showAuthButtons = !initializing && !user;

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo} aria-label="Skyline homepage">
          Skyline
        </Link>

        <nav className={styles.nav} aria-label="User navigation">
          {showAuthButtons ? (
            <>
              <NavLink to="/signup" className={styles.link}>
                Sign up
              </NavLink>
              <NavLink to="/login" className={styles.linkOutlined}>
                Log in
              </NavLink>
            </>
          ) : null}
        </nav>
      </div>
    </header>
  );
}