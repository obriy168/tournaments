import { useEffect, type ReactNode, useRef } from "react";
import { useAuthStore } from "@/features/auth/store/authStore";
import { AuthContext } from "./authContextValue";

export function AuthProvider({ children }: { children: ReactNode }) {
  const store = useAuthStore();
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      store.fetchMe();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        const state = useAuthStore.getState();
        if (state.user && !state.initializing) {
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