import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserByEmail, type User } from "@/services/api";

export const userLookupKeys = {
  all: ["user-lookup"] as const,
  byEmail: (email: string) => [...userLookupKeys.all, email] as const,
};

export function useUserLookup(email: string) {
  return useQuery<User | null, Error>({
    queryKey: userLookupKeys.byEmail(email),
    queryFn: () => getUserByEmail(email),
    enabled: !!email && email.includes("@"),
    staleTime: 1000 * 60 * 2,
  });
}

export function useInvalidateUserLookup() {
  const queryClient = useQueryClient();
  return (email: string) => {
    queryClient.invalidateQueries({ queryKey: userLookupKeys.byEmail(email) });
  };
}