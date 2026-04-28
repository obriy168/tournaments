import { Link, NavLink } from "react-router-dom";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo} aria-label="Skyline homepage">
          Skyline
        </Link>

        <div className={styles.nav} aria-label="User navigation">
          <NavLink to="/signup" className={styles.link}>
            Sign up
          </NavLink>
          <NavLink to="/login" className={styles.linkOutlined}>
            Log in
          </NavLink>
        </div>
      </div>
    </header>
  );
}
