import { useQuery } from "@tanstack/react-query";
import { getAllUsers, type User } from "@/services/api";

export function useUserLookup(email: string) {
  return useQuery({
    queryKey: ["user-lookup", email],
    queryFn: async () => {
      const users = await getAllUsers();
      const found = users.find(
        (u: User) => u.email.toLowerCase() === email.toLowerCase()
      );
      return found || null;
    },
    enabled: !!email && email.includes("@"),
    staleTime: 1000 * 60 * 2,
  });
}