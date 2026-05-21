import { usePagination } from "@/hooks/usePagination";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  searchTasks,
  getAllTasksPaginated,
  autoAssignJury,
  type Task,
} from "@/services/api";

export const tasksKeys = {
  all: ["tasks"] as const,
  byTournament: (tournamentId: number) => [...tasksKeys.all, "tournament", tournamentId] as const,
  paginated: (page: number, limit: number, search?: string, status?: string) => 
    [...tasksKeys.all, "paginated", page, limit, search, status] as const,
};

export function useTasksByTournament(tournamentId: number | null) {
  return useQuery({
    queryKey: tasksKeys.byTournament(tournamentId ?? 0),
    queryFn: () => getTasks(tournamentId!),
    enabled: !!tournamentId,
  });
}

export function useTasksPaginated(searchText?: string, status?: Task["status"]) {
  return usePagination<Task>({
    queryKey: tasksKeys.all,
    fetchFn: (params) =>
      searchText?.trim() || status
        ? searchTasks(searchText, status, params)
        : getAllTasksPaginated(params),
    enabled: true,
    extraDeps: [searchText, status],
  });
}

export function useTasksByTournamentPaginated(
  tournamentId: number | null,
  searchText?: string,
  status?: Task["status"]
) {
  return usePagination<Task>({
    queryKey: tasksKeys.byTournament(tournamentId ?? 0),
    fetchFn: (params) =>
      searchTasks(searchText, status, { ...params, tournament_id: tournamentId ?? undefined }),
    enabled: !!tournamentId,
    extraDeps: [searchText, status],
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Task>) => createTask(data),
    onSuccess: (_, variables) => {
      if (variables.tournament_id) {
        queryClient.invalidateQueries({ queryKey: tasksKeys.byTournament(variables.tournament_id) });
      }
      queryClient.invalidateQueries({ queryKey: tasksKeys.all });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Task> }) => updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.all });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.all });
    },
  });
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: Task["status"] }) => updateTaskStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.all });
    },
  });
}

export function useAutoAssignJury() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, minJury }: { taskId: number; minJury: number }) => 
      autoAssignJury(taskId, minJury),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.all });
    },
  });
}