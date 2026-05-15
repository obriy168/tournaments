import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTeam } from "@/services/api";

export function useDeleteTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteTeam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-teams"] });
    },
  });
}