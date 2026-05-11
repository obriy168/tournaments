import { create } from "zustand";
import { devtools } from "zustand/middleware";
import axios from "axios";
import { api, type User } from "@/services/api";
import { queryClient } from "@/queryClient";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  initializing: boolean;
  initialized: boolean;
  hasTeam: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  checkTeam: () => Promise<void>;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

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

function extractRoleFromResponse(data: BackendUserResponse): string {
  if (data.roles && Array.isArray(data.roles) && data.roles.length > 0) {
    const globalRole = data.roles.find((r) => !r.tournament_id);
    if (globalRole) return globalRole.role.toLowerCase();
    return data.roles[0].role.toLowerCase();
  }
  if ("role" in data && typeof (data as Record<string, unknown>).role === "string") {
    return ((data as Record<string, unknown>).role as string).toLowerCase();
  }
  return "participant";
}

function normalizeUserRole(user: BackendUserResponse): User {
  const role = extractRoleFromResponse(user);
  return {
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    role: role as User["role"],
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

      fetchMe: async () => {
        if (get().initialized && get().user) return;

        if (!localStorage.getItem(AUTH_FLAG)) {
          set({ user: null, initializing: false, initialized: true });
          return;
        }

        const attemptFetch = async (attempt: number): Promise<void> => {
          try {
            const { data } = await api.get<BackendUserResponse>("/auth/me");
            const normalizedUser = normalizeUserRole(data);
            
            set({ user: normalizedUser, initializing: false, initialized: true });
            await get().checkTeam();
          } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
              const status = err.response?.status;

              if (status === 401 || status === 403) {
                localStorage.removeItem(AUTH_FLAG);
                set({ user: null, initializing: false, initialized: true });
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
            set({ user: null, initializing: false, initialized: true });
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
          const normalizedUser = normalizeUserRole(data);
          localStorage.setItem(AUTH_FLAG, "1");
          set({ user: normalizedUser, isLoading: false, initialized: true });
          await get().checkTeam();
          return normalizedUser;
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
          set({ user: null, isLoading: false, initialized: false, hasTeam: false });
        }
      },
    }),
    { name: "AuthStore" }
  )
);