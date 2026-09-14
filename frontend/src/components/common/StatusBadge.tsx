import { Badge } from "@/components/ui/badge";
import type { TaskStatus } from "@/lib/types";

const STATUS_LABEL: Record<TaskStatus, string> = {
  NOT_STARTED: "Not started",
  IN_PROGRESS: "In progress",
  READY_FOR_REVIEW: "Ready for review",
  CHANGES_REQUESTED: "Changes requested",
  WAITING_FOR_CLIENT: "Waiting for client",
  COMPLETED: "Completed",
};

const STATUS_VARIANT: Record<TaskStatus, "default" | "secondary" | "destructive" | "outline"> = {
  NOT_STARTED: "outline",
  IN_PROGRESS: "secondary",
  READY_FOR_REVIEW: "default",
  CHANGES_REQUESTED: "destructive",
  WAITING_FOR_CLIENT: "outline",
  COMPLETED: "secondary",
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>;
}
