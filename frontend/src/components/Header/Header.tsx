import { Link, NavLink } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useEffect, useRef, useState, useCallback } from "react";
import styles from "./Header.module.css";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher/LanguageSwitcher";

export default function Header() {
  const { user, initializing } = useAuth();
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const { t } = useTranslation();

  const handleScroll = useCallback(() => {
    if (!ticking.current) {
      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const direction = currentScrollY > lastScrollY.current ? "down" : "up";
        const threshold = 10;

        if (currentScrollY < 50) {
          setHidden(false);
        } else if (
          direction === "down" &&
          currentScrollY - lastScrollY.current > threshold
        ) {
          setHidden(true);
        } else if (
          direction === "up" &&
          lastScrollY.current - currentScrollY > threshold
        ) {
          setHidden(false);
        }

        lastScrollY.current = currentScrollY;
        ticking.current = false;
      });
      ticking.current = true;
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const showAuthButtons = !initializing && !user;

  return (
    <header className={`${styles.header} ${hidden ? styles.headerHidden : ""}`}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo} aria-label="Skyline homepage">
          Skyline
        </Link>

        <nav className={styles.nav} aria-label="User navigation">
          <LanguageSwitcher />
          {showAuthButtons ? (
            <>
              <NavLink to="/signup" className={styles.link}>
                {t("header.signup")}
              </NavLink>
              <NavLink to="/login" className={styles.linkOutlined}>
                {t("header.login")}
              </NavLink>
            </>
          ) : null}
        </nav>
      </div>
    </header>
  );
}