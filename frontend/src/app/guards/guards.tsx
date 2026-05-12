import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/authStore";
import type { UserRole } from "@/features/auth/context/authContextValue";
import styles from "./guards.module.css";

function normalizeRole(role: UserRole, activeRole?: string | null): Exclude<UserRole, "captain"> {
  if (activeRole) return activeRole.toLowerCase() as Exclude<UserRole, "captain">;
  return role === "captain" ? "participant" : role;
}

function getRolePath(role: UserRole, activeRole?: string | null): string {
  return normalizeRole(role, activeRole);
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
  const initializing = useAuthStore((s) => s.initializing);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (initializing) return <LoadingFallback />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <Outlet />;
}

export function PublicOnly() {
  const initializing = useAuthStore((s) => s.initializing);
  const user = useAuthStore((s) => s.user);
  const activeRole = useAuthStore((s) => s.activeRole);

  if (initializing) return <LoadingFallback />;
  if (user) return <Navigate to={`/app/${getRolePath(user.role, activeRole)}`} replace />;
  return <Outlet />;
}

export function RoleGuard({ allowed }: { allowed: UserRole[] }) {
  const initializing = useAuthStore((s) => s.initializing);
  const user = useAuthStore((s) => s.user);
  const activeRole = useAuthStore((s) => s.activeRole);

  if (initializing) return <LoadingFallback />;
  if (!user) return <Navigate to="/login" replace />;

  const effectiveRole = normalizeRole(user.role, activeRole);
  const normalizedAllowed = allowed.map((r) => normalizeRole(r));

  if (!normalizedAllowed.includes(effectiveRole)) {
    return <Navigate to={`/app/${getRolePath(user.role, activeRole)}`} replace />;
  }
  return <Outlet />;
}

export function RoleRedirect() {
  const initializing = useAuthStore((s) => s.initializing);
  const user = useAuthStore((s) => s.user);
  const activeRole = useAuthStore((s) => s.activeRole);

  if (initializing) return <LoadingFallback />;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/app/${getRolePath(user.role, activeRole)}`} replace />;
}