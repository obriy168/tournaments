import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  getRequirements,
  createRequirement,
  deleteRequirements,
  getRequirementGroups,
  createRequirementGroup,
  deleteRequirementGroup,
  autoAssignJury,
  type Task,
  type Requirement,
  type RequirementGroup,
} from "@/services/api";

export const roundsKeys = {
  all: ["rounds"] as const,
  byTournament: (tournamentId: number) => [...roundsKeys.all, "tournament", tournamentId] as const,
  requirements: (taskId: number) => ["requirements", taskId] as const,
  requirementGroups: (taskId: number) => ["requirement-groups", taskId] as const,
};

export function useRoundsByTournament(tournamentId: number | null) {
  return useQuery({
    queryKey: roundsKeys.byTournament(tournamentId ?? 0),
    queryFn: () => getTasks(tournamentId!),
    enabled: !!tournamentId,
  });
}

export function useCreateRound() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Task>) => createTask(data),
    onSuccess: (_, variables) => {
      if (variables.tournament_id) {
        queryClient.invalidateQueries({ queryKey: roundsKeys.byTournament(variables.tournament_id) });
      }
    },
  });
}

export function useUpdateRound() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Task> }) => updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roundsKeys.all });
    },
  });
}

export function useDeleteRound() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roundsKeys.all });
    },
  });
}

export function useUpdateRoundStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: Task["status"] }) => updateTaskStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roundsKeys.all });
    },
  });
}

export function useRequirements(taskId: number | null) {
  return useQuery({
    queryKey: roundsKeys.requirements(taskId ?? 0),
    queryFn: () => getRequirements(taskId!),
    enabled: !!taskId,
  });
}

export function useCreateRequirement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Requirement>) => createRequirement(data),
    onSuccess: (_, variables) => {
      if (variables.requirement_group_id) {
        queryClient.invalidateQueries({ queryKey: roundsKeys.requirements(0) });
      }
    },
  });
}

export function useDeleteRequirements() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) => deleteRequirements(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roundsKeys.all });
    },
  });
}

export function useRequirementGroups(taskId: number | null) {
  return useQuery({
    queryKey: roundsKeys.requirementGroups(taskId ?? 0),
    queryFn: () => getRequirementGroups(taskId!),
    enabled: !!taskId,
  });
}

export function useCreateRequirementGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<RequirementGroup>) => createRequirementGroup(data),
    onSuccess: (_, variables) => {
      if (variables.task_id) {
        queryClient.invalidateQueries({ queryKey: roundsKeys.requirementGroups(variables.task_id) });
      }
    },
  });
}

export function useDeleteRequirementGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteRequirementGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roundsKeys.all });
    },
  });
}

export function useAutoAssignJury() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, minJury }: { taskId: number; minJury: number }) => autoAssignJury(taskId, minJury),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roundsKeys.all });
    },
  });
}