import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getTaskById,
  listTasks,
  reassignTask,
  updateTaskStatus,
  type ReassignTaskInput,
  type TaskFilters,
} from "@/api/tasks.api";
import { queryKeys } from "@/lib/queryKeys";
import type { TaskStatus } from "@/lib/types";

export function useTasks(filters: TaskFilters) {
  return useQuery({
    queryKey: queryKeys.tasks.all(filters),
    queryFn: () => listTasks(filters),
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: queryKeys.tasks.detail(id),
    queryFn: () => getTaskById(id),
    enabled: !!id,
  });
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: TaskStatus; note?: string }) =>
      updateTaskStatus(id, status, note),
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(task.id) });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard() });
    },
  });
}

export function useReassignTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ReassignTaskInput }) =>
      reassignTask(id, input),
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(task.id) });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
