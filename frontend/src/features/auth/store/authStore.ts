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
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const useAuthStore = create<AuthState>()(
  devtools(
    (set, get) => ({
      user: null,
      isLoading: false,
      initializing: true,
      initialized: false,

      fetchMe: async () => {
        if (get().initialized && get().user) return;

        const attemptFetch = async (attempt: number): Promise<void> => {
          try {
            const { data } = await api.get<User>("/auth/me");
            set({ user: data, initializing: false, initialized: true });
          } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
              const status = err.response?.status;

              if (status === 401 || status === 403) {
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

            set({ user: null, initializing: false, initialized: true });
          }
        };

        await attemptFetch(0);
      },

      refreshSession: async () => {
        try {
          await api.post("/auth/refresh");
          const { data } = await api.get<User>("/auth/me");
          set({ user: data });
        } catch {
          set({ user: null });
        }
      },

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          await api.post("/auth/login", { email, password });
          const { data } = await api.get<User>("/auth/me");
          set({ user: data, isLoading: false, initialized: true });
          return data;
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
          set({ user: null, isLoading: false, initialized: false });
        }
      },
    }),
    { name: "AuthStore" }
  )
);