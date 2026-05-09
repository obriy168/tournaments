import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { UserRole } from "@/features/auth/context/authContextValue";
import styles from "./guards.module.css";

function normalizeRole(role: UserRole): Exclude<UserRole, "captain"> {
  return role === "captain" ? "participant" : role;
}

function getRolePath(role: UserRole): string {
  return normalizeRole(role);
}

export function LoadingFallback() {
  return (
    <div className={styles.loadingFallback}>
      <div className={styles.logo}>Skyline</div>
      <div className={styles.bar}>
        <div className={styles.progress} />
      </div>
    </div>
  );
}

export function RequireAuth() {
  const { user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) return <LoadingFallback />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <Outlet />;
}

export function PublicOnly() {
  const { user, initializing } = useAuth();
  if (initializing) return <LoadingFallback />;
  if (user) return <Navigate to={`/app/${getRolePath(user.role)}`} replace />;
  return <Outlet />;
}

export function RoleGuard({ allowed }: { allowed: UserRole[] }) {
  const { user, initializing } = useAuth();

  if (initializing) return <LoadingFallback />;
  if (!user) return <Navigate to="/login" replace />;

  const effectiveRole = normalizeRole(user.role);
  const normalizedAllowed = allowed.map(normalizeRole);

  if (!normalizedAllowed.includes(effectiveRole)) {
    return <Navigate to={`/app/${getRolePath(user.role)}`} replace />;
  }
  return <Outlet />;
}

export function RoleRedirect() {
  const { user, initializing } = useAuth();
  if (initializing) return <LoadingFallback />;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/app/${getRolePath(user.role)}`} replace />;
}