import { useState, useRef, useLayoutEffect, useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useLogout } from "@/features/auth/hooks/useLogout";
import TournamentSwitcher from "@/components/TournamentSwitcher/TournamentSwitcher";
import type { LinkItem, SafeUserRole } from "./Sidebar.types";
import styles from "./Sidebar.module.css";
import { LanguageSwitcher } from "../LanguageSwitcher/LanguageSwitcher";
import { useTranslation } from "react-i18next";

export default function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const hasTeam = useAuthStore((s) => s.hasTeam);
  const activeRole = useAuthStore((s) => s.activeRole);
  const initializing = useAuthStore((s) => s.initializing);
  const logout = useLogout();
  const location = useLocation();
  const { t } = useTranslation();

  const navRef = useRef<HTMLElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({
    opacity: 0,
  });

  useLayoutEffect(() => {
    const navElement = navRef.current;
    if (!navElement) return;

    const updateIndicator = () => {
      const activeLinks = navElement.querySelectorAll(`.${styles.linkCurrent}`);
      let activeLink: HTMLElement | null = null;

      for (const link of activeLinks) {
        const htmlLink = link as HTMLElement;
        const isVisible = document.hidden || htmlLink.offsetParent !== null;
        if (isVisible) {
          activeLink = htmlLink;
          break;
        }
      }

      if (!activeLink) {
        setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
        return;
      }

      const containerRect = navElement.getBoundingClientRect();
      const activeRect = activeLink.getBoundingClientRect();

      if (activeRect.width === 0 && activeRect.height === 0) return;

      const top = activeRect.top - containerRect.top + navElement.scrollTop;
      const left = activeRect.left - containerRect.left + navElement.scrollLeft;
      const borderRadius = window.getComputedStyle(activeLink).borderRadius;

      setIndicatorStyle({
        transform: `translate(${left}px, ${top}px)`,
        width: `${activeRect.width}px`,
        height: `${activeRect.height}px`,
        borderRadius,
        opacity: 1,
      });
    };

    updateIndicator();

    const resizeObserver = new ResizeObserver(() => updateIndicator());
    resizeObserver.observe(navElement);
    const children = navElement.querySelectorAll(`.${styles.link}`);
    children.forEach((child) => resizeObserver.observe(child));

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        requestAnimationFrame(updateIndicator);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", updateIndicator);

    return () => {
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", updateIndicator);
    };
  }, [location.pathname, initializing, user, activeRole, hasTeam]);

  const rawRole = activeRole || user?.role || "participant";
  const effectiveRole: SafeUserRole = rawRole as SafeUserRole;

  const links = useMemo<LinkItem[]>(() => {
    switch (effectiveRole) {
      case "admin":
        return [
          { to: "/app/admin", label: t("sidebar.btns.dashboard"), end: true },
          { to: "/app/admin/tournaments", label: t("sidebar.btns.tournaments"), end: false },
          { to: "/app/admin/teams", label: t("sidebar.btns.teams"), end: false },
          { to: "/app/admin/tasks", label: t("sidebar.btns.tasks"), end: false },
          { to: "/app/admin/submissions", label: t("sidebar.btns.submissions"), end: false },
          { to: "/app/admin/jury", label: t("sidebar.btns.jury"), end: false },
        ];
      case "organizer":
        return [
          { to: "/app/organizer", label: t("sidebar.btns.dashboard"), end: true },
          { to: "/app/organizer/tournaments", label: t("sidebar.btns.tournament"), end: false },
          { to: "/app/organizer/tasks", label: t("sidebar.btns.tasks"), end: false },
          { to: "/app/organizer/teams", label: t("sidebar.btns.teams"), end: false },
        ];
      case "jury":
        return [
          { to: "/app/jury", label: t("sidebar.btns.dashboard"), end: true },
          { to: "/app/jury/assignments", label: t("sidebar.btns.assignments"), end: false },
          { to: "/app/jury/evaluation", label: t("sidebar.btns.evaluation"), end: false },
        ];
      case "participant":
        if (hasTeam) {
          return [
            { to: "/app/participant", label: t("sidebar.btns.dashboard"), end: true },
            { to: "/app/participant/team", label: t("sidebar.btns.myTeam"), end: false },
            { to: "/app/participant/tournament", label: t("sidebar.btns.tournament"), end: false },
            { to: "/app/participant/submissions", label: t("sidebar.btns.submissions"), end: false },
          ];
        }
        return [{ to: "/app/participant", label: t("sidebar.btns.dashboard"), end: true }];
      case "captain":
        return [
          { to: "/app/participant", label: t("sidebar.btns.dashboard"), end: true },
          { to: "/app/participant/team", label: t("sidebar.btns.myTeam"), end: false },
          { to: "/app/participant/tournament", label: t("sidebar.btns.tournament"), end: false },
          { to: "/app/participant/submissions", label: t("sidebar.btns.submissions"), end: false },
        ];
      default:
        return [];
    }
  }, [effectiveRole, hasTeam, t]);

  if (initializing || !user) return null;

  return (
    <aside className={styles.sidebar} aria-label="Main navigation">
      <div className={styles.header}>
        <NavLink to="/app" className={styles.logo}>
          Skyline
        </NavLink>
        <LanguageSwitcher />
      </div>

      <nav ref={navRef} className={styles.nav}>
        <div
          className={styles.indicator}
          style={indicatorStyle}
          aria-hidden="true"
        />

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

        <NavLink
          to="/app/profile"
          className={({ isActive }) =>
            `${styles.link} ${styles.mobileOnly} ${
              isActive ? styles.linkCurrent : ""
            }`
          }
        >
          {t("sidebar.mainbtns.profile")}
        </NavLink>
        <button
          onClick={logout}
          className={`${styles.link} ${styles.mobileOnly} ${styles.linkDanger}`}
          type="button"
        >
          {t("sidebar.mainbtns.logout")}
        </button>
      </nav>

      <TournamentSwitcher />

      <div className={styles.footer}>
        <NavLink
          to="/app/profile"
          className={({ isActive }) =>
            isActive ? `${styles.link} ${styles.linkCurrent}` : styles.link
          }
        >
          {t("sidebar.mainbtns.profile")}
        </NavLink>
        <button
          onClick={logout}
          className={`${styles.link} ${styles.linkDanger}`}
          type="button"
        >
          {t("sidebar.mainbtns.logout")}
        </button>
      </div>
    </aside>
  );
}