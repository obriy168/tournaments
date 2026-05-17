import { create } from "zustand";
import { devtools } from "zustand/middleware";
import axios from "axios";
import { api, resetSessionExpired, type User, type Team } from "@/services/api";
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

function isGlobalAdmin(data: BackendUserResponse): boolean {
  if (!data.roles) return false;
  return data.roles.some(
    (r) => !r.tournament_id && normalizeRole(r.role) === "admin"
  );
}

function resolveActiveState(data: BackendUserResponse): {
  activeId: number | null;
  activeRole: string | null;
} {
  if (isGlobalAdmin(data)) {
    return { activeId: null, activeRole: "admin" };
  }

  const tournamentRoles = (data.roles || []).filter(
    (r): r is BackendUserRole & { tournament_id: number } => !!r.tournament_id
  );

  const savedTournamentId = localStorage.getItem(ACTIVE_TOURNAMENT_KEY);
  const savedRole = localStorage.getItem(ACTIVE_ROLE_KEY);

  let activeId: number | null = null;
  let activeRole: string | null = null;

  if (savedTournamentId && savedTournamentId !== "null" && savedTournamentId !== "0") {
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

            let effectiveRoles = data.roles || [];

            if (!effectiveRoles.some((r) => r.tournament_id)) {
              try {
                const { data: teams } = await api.get<Team[]>(`/users_team/${user.id}`);
                if (Array.isArray(teams) && teams.length > 0) {
                  const tournamentIds = [...new Set(teams.map((t) => t.tournament_id).filter(Boolean))];
                  effectiveRoles = tournamentIds.map((tid) => ({
                    role: "participant",
                    tournament_id: tid,
                  }));
                }
              } catch {
                // игнорируем ошибку
              }
            }

            const { activeId, activeRole } = resolveActiveState({
              ...data,
              roles: effectiveRoles,
            });

            const savedTournamentId = localStorage.getItem(ACTIVE_TOURNAMENT_KEY);
            const savedRole = localStorage.getItem(ACTIVE_ROLE_KEY);

            let finalActiveId = activeId;
            let finalActiveRole = activeRole;

            if (activeRole !== "admin" && savedTournamentId && savedTournamentId !== "null" && savedTournamentId !== "0") {
              const savedId = Number(savedTournamentId);
              const hasRoleForSavedTournament = effectiveRoles.some(
                (r) => r.tournament_id === savedId
              );

              if (hasRoleForSavedTournament) {
                finalActiveId = savedId;
                finalActiveRole = savedRole ? normalizeRole(savedRole) : activeRole;
              }
            }

            set({
              user,
              initializing: false,
              initialized: true,
              activeTournamentId: finalActiveId,
              activeRole: finalActiveRole,
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
        const activeTournamentId = get().activeTournamentId;

        if (!user) {
          set({ hasTeam: false });
          return;
        }

        if (activeTournamentId === null) {
          set({ hasTeam: false });
          return;
        }

        try {
          const { data: teams } = await api.get<Team[]>(`/users_team/${user.id}`);

          const hasTeamForActiveTournament =
            Array.isArray(teams) &&
            teams.some((t) => t.tournament_id === activeTournamentId);

          set({ hasTeam: hasTeamForActiveTournament });
        } catch {
          set({ hasTeam: false });
        }
      },

      login: async (email, password) => {
        resetSessionExpired();
        set({ isLoading: true });
        try {
          await api.post("/auth/login", { email, password });
          const { data } = await api.get<BackendUserResponse>("/auth/me");
          const user = normalizeUser(data);

          let effectiveRoles = data.roles || [];

          if (!effectiveRoles.some((r) => r.tournament_id)) {
            try {
              const { data: teams } = await api.get<Team[]>(`/users_team/${user.id}`);
              if (Array.isArray(teams) && teams.length > 0) {
                const tournamentIds = [...new Set(teams.map((t) => t.tournament_id).filter(Boolean))];
                effectiveRoles = tournamentIds.map((tid) => ({
                  role: "participant",
                  tournament_id: tid,
                }));
              }
            } catch {
              // игнорируем
            }
          }

          const { activeId, activeRole } = resolveActiveState({
            ...data,
            roles: effectiveRoles,
          });

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
          resetSessionExpired();
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

        if (tournamentId === 0 && explicitRole === "admin") {
          localStorage.removeItem(ACTIVE_TOURNAMENT_KEY);
          localStorage.setItem(ACTIVE_ROLE_KEY, "admin");
          set({ activeTournamentId: null, activeRole: "admin" });
          queryClient.invalidateQueries({ queryKey: ["tasks"] });
          queryClient.invalidateQueries({ queryKey: ["teams"] });
          queryClient.invalidateQueries({ queryKey: ["rounds"] });
          queryClient.invalidateQueries({ queryKey: ["submissions"] });
          queryClient.invalidateQueries({ queryKey: ["organizer-stats"] });
          return;
        }

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

        get().checkTeam();

        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        queryClient.invalidateQueries({ queryKey: ["teams"] });
        queryClient.invalidateQueries({ queryKey: ["rounds"] });
        queryClient.invalidateQueries({ queryKey: ["submissions"] });
        queryClient.invalidateQueries({ queryKey: ["organizer-stats"] });
      },
    }),
    { name: "AuthStore" }
  )
);