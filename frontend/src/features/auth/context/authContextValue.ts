import { createContext } from "react";
import type { User } from "@/services/api";

export type UserRole = User["role"];

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  initializing: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);