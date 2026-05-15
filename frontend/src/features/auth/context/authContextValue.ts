import { createContext } from "react";
import type { User } from "@/services/api";

export type UserRole = User["role"];

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  initializing: boolean;
  hasTeam: boolean;
  activeTournamentId: number | null;
  activeRole: string | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  setActiveTournament: (tournamentId: number) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);