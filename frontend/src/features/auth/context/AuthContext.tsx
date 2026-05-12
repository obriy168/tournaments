import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "@/features/auth/store/authStore";
import { AuthContext } from "./authContextValue";

export function AuthProvider({ children }: { children: ReactNode }) {
  const store = useAuthStore();

  useEffect(() => {
    store.fetchMe();
  }, [store.fetchMe]);

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

  const value = {
    user: store.user,
    loading: store.isLoading,
    initializing: store.initializing,
    hasTeam: store.hasTeam,
    activeTournamentId: store.activeTournamentId,
    activeRole: store.activeRole,
    login: store.login,
    logout: store.logout,
    setActiveTournament: store.setActiveTournament,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}