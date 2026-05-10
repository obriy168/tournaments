import { useQuery } from "@tanstack/react-query";
import { getEvaluationsByTask } from "@/services/api";

export function useTaskEvaluations(taskId: number) {
  return useQuery({
    queryKey: ["evaluations", taskId],
    queryFn: () => getEvaluationsByTask(taskId),
    enabled: !!taskId,
  });
}