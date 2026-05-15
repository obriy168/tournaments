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
  setActiveTournament: (tournamentId: number, explicitRole?: string) => void;
  _setInternal: (patch: Partial<AuthState>) => void;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const AUTH_FLAG = "skyline_auth";
const ACTIVE_TOURNAMENT_KEY = "skyline_active_tournament";
const ACTIVE_ROLE_KEY = "skyline_active_role";

function normalizeRole(role: string): string {
  return role.toLowerCase().trim();
}

function extractGlobalRole(data: BackendUserResponse): string {
  if (!data.roles || !Array.isArray(data.roles) || data.roles.length === 0) {
    return "participant";
  }
  const globalRole = data.roles.find((r) => !r.tournament_id);
  if (globalRole) return normalizeRole(globalRole.role);
  return normalizeRole(data.roles[0].role);
}

function getTournamentRoles(
  data: BackendUserResponse,
  tournamentId: number
): string[] {
  return (data.roles || [])
    .filter((r) => r.tournament_id === tournamentId)
    .map((r) => normalizeRole(r.role));
}

function resolveActiveState(data: BackendUserResponse): {
  activeId: number | null;
  activeRole: string | null;
} {
  const tournamentRoles = (data.roles || []).filter(
    (r): r is BackendUserRole & { tournament_id: number } => !!r.tournament_id
  );

  const savedTournamentId = localStorage.getItem(ACTIVE_TOURNAMENT_KEY);
  const savedRole = localStorage.getItem(ACTIVE_ROLE_KEY);

  let activeId: number | null = null;
  let activeRole: string | null = null;

  if (savedTournamentId) {
    const savedId = Number(savedTournamentId);
    const rolesForSavedTournament = getTournamentRoles(data, savedId);

    if (rolesForSavedTournament.length > 0) {
      activeId = savedId;
      if (savedRole && rolesForSavedTournament.includes(normalizeRole(savedRole))) {
        activeRole = normalizeRole(savedRole);
      } else {
        activeRole = rolesForSavedTournament[0];
      }
    }
  }

  if (!activeId && tournamentRoles.length > 0) {
    activeId = tournamentRoles[0].tournament_id;
    activeRole = normalizeRole(tournamentRoles[0].role);
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
        if (state.initialized && state.user) {
          return;
        }

        if (!localStorage.getItem(AUTH_FLAG)) {
          set({
            user: null,
            initializing: false,
            initialized: true,
            activeTournamentId: null,
            activeRole: null,
            hasTeam: false,
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
                localStorage.removeItem(ACTIVE_TOURNAMENT_KEY);
                localStorage.removeItem(ACTIVE_ROLE_KEY);
                set({
                  user: null,
                  initializing: false,
                  initialized: true,
                  activeTournamentId: null,
                  activeRole: null,
                  hasTeam: false,
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
            localStorage.removeItem(ACTIVE_TOURNAMENT_KEY);
            localStorage.removeItem(ACTIVE_ROLE_KEY);
            set({
              user: null,
              initializing: false,
              initialized: true,
              activeTournamentId: null,
              activeRole: null,
              hasTeam: false,
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
          localStorage.removeItem(ACTIVE_TOURNAMENT_KEY);
          localStorage.removeItem(ACTIVE_ROLE_KEY);
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

      setActiveTournament: (tournamentId: number, explicitRole?: string) => {
        const state = get();
        const tournamentRoles = getTournamentRoles(
          { roles: state.user?.roles || [] } as BackendUserResponse,
          tournamentId
        );

        let newRole: string;
        if (explicitRole && tournamentRoles.includes(normalizeRole(explicitRole))) {
          newRole = normalizeRole(explicitRole);
        } else if (tournamentRoles.length > 0) {
          newRole = tournamentRoles[0];
        } else {
          newRole = state.user?.role || "participant";
        }

        localStorage.setItem(ACTIVE_TOURNAMENT_KEY, String(tournamentId));
        localStorage.setItem(ACTIVE_ROLE_KEY, newRole);
        set({ activeTournamentId: tournamentId, activeRole: newRole });
        queryClient.clear();
      },
    }),
    { name: "AuthStore" }
  )
);