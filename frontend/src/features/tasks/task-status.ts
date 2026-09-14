import type { Task } from "@/api/tasks.api";
import type { Role, SessionUser, TaskStatus } from "@/lib/types";

/**
 * Mirrors backend/src/modules/tasks/task.service.ts (TRANSITIONS, REVIEW_TRANSITIONS,
 * and the authorization checks in updateTaskStatus). This is intentionally duplicated
 * client-side purely for UX (only offer buttons the API will accept) — the backend
 * remains the source of truth and still rejects invalid/unauthorized transitions.
 * Keep this in sync if task.service.ts changes.
 */
export const TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  NOT_STARTED: ["IN_PROGRESS"],
  IN_PROGRESS: ["READY_FOR_REVIEW", "WAITING_FOR_CLIENT"],
  WAITING_FOR_CLIENT: ["IN_PROGRESS"],
  READY_FOR_REVIEW: ["COMPLETED", "CHANGES_REQUESTED"],
  CHANGES_REQUESTED: ["IN_PROGRESS"],
  COMPLETED: [],
};

export const REVIEW_TRANSITIONS = new Set<TaskStatus>(["COMPLETED", "CHANGES_REQUESTED"]);

export function getAvailableTransitions(task: Task, currentUser: SessionUser): TaskStatus[] {
  const candidates = TRANSITIONS[task.status];

  return candidates.filter((to) => {
    if (REVIEW_TRANSITIONS.has(to)) {
      if (currentUser.role === "TEAM_MEMBER") return false;
      if (task.assignedToId === currentUser.id) return false;
      return true;
    }

    const isAssignee = task.assignedToId === currentUser.id;
    const isManagerOrAdmin: Role[] = ["MANAGER", "ADMIN"];
    return isAssignee || isManagerOrAdmin.includes(currentUser.role);
  });
}

const STATUS_LABEL: Record<TaskStatus, string> = {
  NOT_STARTED: "Not started",
  IN_PROGRESS: "In progress",
  READY_FOR_REVIEW: "Ready for review",
  CHANGES_REQUESTED: "Changes requested",
  WAITING_FOR_CLIENT: "Waiting for client",
  COMPLETED: "Completed",
};

export function statusLabel(status: TaskStatus) {
  return STATUS_LABEL[status];
}
