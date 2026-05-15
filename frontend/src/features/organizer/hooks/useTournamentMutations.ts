import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateTournament,
  deleteTournament,
  updateTournamentStatus,
  type Tournament,
} from "@/services/api";
import { tournamentsKeys } from "@/features/Tournaments/hooks/useTournaments";

export function useUpdateTournament() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Tournament> }) =>
      updateTournament(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tournamentsKeys.all });
    },
  });
}

export function useDeleteTournament() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteTournament(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tournamentsKeys.all });
    },
  });
}

export function useUpdateTournamentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: Tournament["status"] }) =>
      updateTournamentStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tournamentsKeys.all });
    },
  });
}