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

function normalizeUserRole(user: User): User {
  if (!user.role) return { ...user, role: "participant" };
  return user;
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
            const { data } = await api.get<User>("/auth/me");
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
          const { data: teams } = await api.get(`/users_team/${user.id}`);
          set({ hasTeam: Array.isArray(teams) && teams.length > 0 });
        } catch {
          set({ hasTeam: false });
        }
      },

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          await api.post("/auth/login", { email, password });
          const { data } = await api.get<User>("/auth/me");
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