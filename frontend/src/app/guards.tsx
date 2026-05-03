import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { UserRole } from "@/features/auth/context/authContextValue";

function normalizeRole(role: UserRole): Exclude<UserRole, "captain"> {
  return role === "captain" ? "participant" : role;
}

function getRolePath(role: UserRole): string {
  return normalizeRole(role);
}

export function LoadingFallback() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "#ffffff",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <div
        style={{
          fontSize: "28px",
          fontWeight: 700,
          letterSpacing: "-1px",
          fontFamily: '"Inter", sans-serif',
        }}
      >
        Skyline
      </div>
      <div
        style={{
          width: "120px",
          height: "3px",
          background: "#eeeeee",
          borderRadius: "3px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: "100%",
            background: "#000000",
            borderRadius: "3px",
            animation: "loadBar 1s ease-in-out infinite",
          }}
        />
      </div>
      <style>{`
        @keyframes loadBar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
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