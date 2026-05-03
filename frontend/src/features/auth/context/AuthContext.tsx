import { useEffect, useMemo, type ReactNode } from "react";
import { useAuthStore } from "@/features/auth/store/authStore";
import { AuthContext } from "./authContextValue";

export function AuthProvider({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.isLoading);
  const initializing = useAuthStore((s) => s.initializing);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const fetchMe = useAuthStore((s) => s.fetchMe);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        const state = useAuthStore.getState();
        if (state.user) {
          state.fetchMe();
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      initializing,
      login,
      logout,
    }),
    [user, loading, initializing, login, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}