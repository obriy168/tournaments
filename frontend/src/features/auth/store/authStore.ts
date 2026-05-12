import { create } from "zustand";
import { devtools } from "zustand/middleware";
import axios from "axios";
import { api, type User } from "@/services/api";
import { queryClient } from "@/queryClient";

interface BackendUserRole {
  role: string;
  tournament_id?: number | null;
}

interface BackendUserResponse {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  roles: BackendUserRole[];
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  initializing: boolean;
  initialized: boolean;
  hasTeam: boolean;
  activeTournamentId: number | null;
  activeRole: string | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  checkTeam: () => Promise<void>;
  setActiveTournament: (tournamentId: number) => void;
  _setInternal: (patch: Partial<AuthState>) => void;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function extractGlobalRole(data: BackendUserResponse): string {
  if (data.roles && Array.isArray(data.roles) && data.roles.length > 0) {
    const globalRole = data.roles.find((r) => !r.tournament_id);
    if (globalRole) return globalRole.role.toLowerCase();
    return data.roles[0].role.toLowerCase();
  }
  return "participant";
}

function resolveActiveState(data: BackendUserResponse): {
  activeId: number | null;
  activeRole: string | null;
} {
  const userTournaments = (data.roles || [])
    .filter((r): r is BackendUserRole & { tournament_id: number } => !!r.tournament_id)
    .map((r) => ({ tournamentId: r.tournament_id, role: r.role.toLowerCase() }));

  const saved = localStorage.getItem("skyline_active_tournament");
  let activeId: number | null = null;
  let activeRole: string | null = null;

  if (saved) {
    const savedId = Number(saved);
    const found = userTournaments.find((t) => t.tournamentId === savedId);
    if (found) {
      activeId = found.tournamentId;
      activeRole = found.role;
    }
  }

  if (!activeId && userTournaments.length > 0) {
    activeId = userTournaments[0].tournamentId;
    activeRole = userTournaments[0].role;
  }

  if (!activeRole) {
    activeRole = extractGlobalRole(data);
  }

  return { activeId, activeRole };
}

function normalizeUser(user: BackendUserResponse): User {
  return {
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    role: extractGlobalRole(user) as User["role"],
    roles: user.roles,
  };
}

const AUTH_FLAG = "skyline_auth";

export const useAuthStore = create<AuthState>()(
  devtools(
    (set, get) => ({
      user: null,
      isLoading: false,
      initializing: true,
      initialized: false,
      hasTeam: false,
      activeTournamentId: null,
      activeRole: null,

      _setInternal: (patch) => set((s) => ({ ...s, ...patch })),

      fetchMe: async () => {
        const state = get();
        if (state.initialized && state.user && state.activeRole) {
          return;
        }

        if (!localStorage.getItem(AUTH_FLAG)) {
          set({
            user: null,
            initializing: false,
            initialized: true,
            activeTournamentId: null,
            activeRole: null,
          });
          return;
        }

        const attemptFetch = async (attempt: number): Promise<void> => {
          try {
            const { data } = await api.get<BackendUserResponse>("/auth/me");
            const user = normalizeUser(data);
            const { activeId, activeRole } = resolveActiveState(data);

            set({
              user,
              initializing: false,
              initialized: true,
              activeTournamentId: activeId,
              activeRole,
            });
            await get().checkTeam();
          } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
              const status = err.response?.status;
              if (status === 401 || status === 403) {
                localStorage.removeItem(AUTH_FLAG);
                localStorage.removeItem("skyline_active_tournament");
                set({
                  user: null,
                  initializing: false,
                  initialized: true,
                  activeTournamentId: null,
                  activeRole: null,
                });
                return;
              }
              if (
                attempt < 2 &&
                (!err.response || err.code === "ERR_NETWORK" || err.code === "ECONNABORTED")
              ) {
                await sleep(1000 * (attempt + 1));
                return attemptFetch(attempt + 1);
              }
            }
            localStorage.removeItem(AUTH_FLAG);
            localStorage.removeItem("skyline_active_tournament");
            set({
              user: null,
              initializing: false,
              initialized: true,
              activeTournamentId: null,
              activeRole: null,
            });
          }
        };

        await attemptFetch(0);
      },

      checkTeam: async () => {
        const user = get().user;
        if (!user) {
          set({ hasTeam: false });
          return;
        }
        try {
          const { data: teams } = await api.get<unknown[]>(`/users_team/${user.id}`);
          set({ hasTeam: Array.isArray(teams) && teams.length > 0 });
        } catch {
          set({ hasTeam: false });
        }
      },

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          await api.post("/auth/login", { email, password });
          const { data } = await api.get<BackendUserResponse>("/auth/me");
          const user = normalizeUser(data);
          const { activeId, activeRole } = resolveActiveState(data);

          localStorage.setItem(AUTH_FLAG, "1");
          set({
            user,
            isLoading: false,
            initialized: true,
            activeTournamentId: activeId,
            activeRole,
          });
          await get().checkTeam();
          return user;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await api.post("/auth/logout");
        } catch (err) {
          console.error("Logout API error:", err);
        } finally {
          queryClient.clear();
          localStorage.removeItem(AUTH_FLAG);
          localStorage.removeItem("skyline_active_tournament");
          set({
            user: null,
            isLoading: false,
            initialized: false,
            hasTeam: false,
            activeTournamentId: null,
            activeRole: null,
          });
        }
      },

      setActiveTournament: (tournamentId: number) => {
        const state = get();
        const roleEntry = state.user?.roles?.find(
          (r) => r.tournament_id === tournamentId
        );
        const newRole = roleEntry
          ? roleEntry.role.toLowerCase()
          : state.user?.role || "participant";

        localStorage.setItem("skyline_active_tournament", String(tournamentId));
        set({ activeTournamentId: tournamentId, activeRole: newRole });
        queryClient.clear();
      },
    }),
    { name: "AuthStore" }
  )
);