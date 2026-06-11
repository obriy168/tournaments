import type { UserRole } from "@/features/auth/context/authContextValue";

export interface LinkItem {
  to: string;
  label: string;
  end: boolean;
}

export type SafeUserRole = UserRole;