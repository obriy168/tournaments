import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth, type UserRole } from "../features/auth/context/AuthContext";

export function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <Outlet />;
}

export function PublicOnly() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/app" replace />;
  return <Outlet />;
}

export function RoleGuard({ allowed }: { allowed: UserRole[] }) {
  const { user } = useAuth();
  if (!user || !allowed.includes(user.role)) {
    return <Navigate to={`/app/${user?.role ?? "participant"}`} replace />;
  }
  return <Outlet />;
}

export function RoleRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/app/${user.role}`} replace />;
}