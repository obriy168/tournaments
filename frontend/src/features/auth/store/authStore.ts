import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { api, type User } from "../../../services/api";

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

export const useAuthStore = create<AuthState>()(
  devtools(
    (set, get) => ({
      user: null,
      isLoading: false,
      initializing: true,
      initialized: false,

      fetchMe: async () => {
        if (get().initialized) return;

        try {
          const { data } = await api.get<User>("/auth/me");
          set({ user: data, initializing: false, initialized: true });
        } catch {
          set({ user: null, initializing: false, initialized: true });
        }
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
          set({ user: null, isLoading: false, initialized: false });
        }
      },
    }),
    { name: "AuthStore" },
  ),
);