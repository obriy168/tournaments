import { useQuery } from "@tanstack/react-query";
import { getRequirements } from "@/services/api";

export function useRequirements(taskId: number) {
  return useQuery({
    queryKey: ["requirements", taskId],
    queryFn: () => getRequirements(taskId),
    enabled: !!taskId,
  });
}