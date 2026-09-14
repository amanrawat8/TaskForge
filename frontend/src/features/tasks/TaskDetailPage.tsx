import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ErrorState } from "@/components/common/ErrorState";
import { ListSkeleton } from "@/components/common/LoadingSkeleton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useAuth } from "@/features/auth/useAuthStore";
import { ReassignTaskDialog } from "@/features/tasks/ReassignTaskDialog";
import { TaskStatusActions } from "@/features/tasks/TaskStatusActions";
import { useTask } from "@/features/tasks/useTasksQueries";
import { getErrorMessage, getErrorStatus } from "@/lib/errors";
import { canReassignTasks } from "@/lib/roles";

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { session } = useAuth();
  const { data: task, isPending, isError, error } = useTask(id!);

  if (isPending) return <ListSkeleton rows={6} />;

  if (isError) {
    const status = getErrorStatus(error);
    return (
      <ErrorState
        title={status === 404 ? "Task not found" : "Couldn't load task"}
        description={status === 404 ? undefined : getErrorMessage(error)}
        backTo="/tasks"
        backLabel="Back to tasks"
      />
    );
  }

  if (!task || !session) return null;

  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <Link to="/tasks" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Back to tasks
      </Link>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg">{task.title}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {task.engagement?.client?.name}
              {task.engagement?.serviceType?.name ? ` · ${task.engagement.serviceType.name}` : ""}
            </p>
          </div>
          <StatusBadge status={task.status} />
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Assignee</p>
              <p className="font-medium">{task.assignedTo?.name ?? "Unassigned"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Due date</p>
              <p className="font-medium">
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}
              </p>
            </div>
            {task.reviewedBy && (
              <div>
                <p className="text-muted-foreground">Reviewed by</p>
                <p className="font-medium">{task.reviewedBy.name}</p>
              </div>
            )}
          </div>

          <Separator />

          <div className="flex flex-wrap items-center gap-2">
            <TaskStatusActions task={task} />
            {canReassignTasks(session.user.role) && <ReassignTaskDialog task={task} />}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">History</CardTitle>
        </CardHeader>
        <CardContent>
          {!task.history || task.history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No status changes yet.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {task.history
                .slice()
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((entry) => (
                  <li key={entry.id} className="text-sm">
                    <p>
                      {entry.fromStatus ? `${entry.fromStatus.replaceAll("_", " ")} → ` : ""}
                      <span className="font-medium">{entry.toStatus.replaceAll("_", " ")}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(entry.createdAt).toLocaleString()}
                      {entry.note ? ` · ${entry.note}` : ""}
                    </p>
                  </li>
                ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
