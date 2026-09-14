import { apiClient } from "@/api/client";
import type { User } from "@/api/users.api";
import type { TaskStatus } from "@/lib/types";

export type TaskHistoryEntry = {
  id: string;
  fromStatus: TaskStatus | null;
  toStatus: TaskStatus;
  changedById: string;
  note: string | null;
  createdAt: string;
};

export type Task = {
  id: string;
  engagementId: string;
  templateId: string | null;
  title: string;
  status: TaskStatus;
  assignedToId: string | null;
  reviewedById: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  assignedTo?: User | null;
  reviewedBy?: User | null;
  engagement?: {
    id: string;
    clientId: string;
    serviceTypeId: string;
    periodStart: string;
    periodEnd: string;
    client?: { id: string; name: string };
    serviceType?: { id: string; name: string; isRecurring: boolean };
  };
  history?: TaskHistoryEntry[];
};

export type TaskFilters = {
  status?: TaskStatus;
  assignedToId?: string;
};

export async function listTasks(filters: TaskFilters) {
  const { data } = await apiClient.get<{ success: true; tasks: Task[] }>("/tasks", {
    params: filters,
  });
  return data.tasks;
}

export async function getTaskById(id: string) {
  const { data } = await apiClient.get<{ success: true; task: Task }>(`/tasks/${id}`);
  return data.task;
}

export async function updateTaskStatus(id: string, status: TaskStatus, note?: string) {
  const { data } = await apiClient.patch<{ success: true; task: Task }>(`/tasks/${id}/status`, {
    status,
    ...(note ? { note } : {}),
  });
  return data.task;
}

export type ReassignTaskInput = {
  assignedToId?: string;
  dueDate?: string;
};

export async function reassignTask(id: string, input: ReassignTaskInput) {
  const { data } = await apiClient.patch<{ success: true; task: Task }>(`/tasks/${id}`, input);
  return data.task;
}
