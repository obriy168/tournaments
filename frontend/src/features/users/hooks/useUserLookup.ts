import { useQuery } from "@tanstack/react-query";
import { getUserByEmail, type User } from "@/services/api";

export function useUserLookup(email: string) {
  return useQuery<User | null, Error>({
    queryKey: ["user-lookup", email],
    queryFn: () => getUserByEmail(email),
    enabled: !!email && email.includes("@"),
    staleTime: 1000 * 60 * 2,
  });
}