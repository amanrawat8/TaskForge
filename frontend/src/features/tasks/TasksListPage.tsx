import { useMemo, useState } from "react";
import { ListChecks } from "lucide-react";
import { Link } from "react-router-dom";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { ListSkeleton } from "@/components/common/LoadingSkeleton";
import { StatusBadge } from "@/components/common/StatusBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/features/auth/useAuthStore";
import { useTasks } from "@/features/tasks/useTasksQueries";
import { useUsers } from "@/features/users/useUsersQueries";
import { getErrorMessage } from "@/lib/errors";
import type { TaskStatus } from "@/lib/types";

const ALL = "__all__";

const STATUS_OPTIONS: TaskStatus[] = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "READY_FOR_REVIEW",
  "CHANGES_REQUESTED",
  "WAITING_FOR_CLIENT",
  "COMPLETED",
];

function isOverdue(dueDate: string | null, status: TaskStatus) {
  if (!dueDate || status === "COMPLETED") return false;
  return new Date(dueDate) < new Date(new Date().toDateString());
}

export function TasksListPage() {
  const { session } = useAuth();
  const isTeamMember = session?.user.role === "TEAM_MEMBER";

  const [status, setStatus] = useState<string>(ALL);
  const [assignedToId, setAssignedToId] = useState<string>(ALL);

  const { data: teamMembers } = useUsers("TEAM_MEMBER", { enabled: !isTeamMember });

  const filters = useMemo(
    () => ({
      ...(status !== ALL ? { status: status as TaskStatus } : {}),
      ...(!isTeamMember && assignedToId !== ALL ? { assignedToId } : {}),
    }),
    [status, assignedToId, isTeamMember],
  );

  const { data: tasks, isPending, isError, error } = useTasks(filters);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl font-semibold">Tasks</h1>
          <p className="text-sm text-muted-foreground">
            {isTeamMember ? "Tasks assigned to you." : "All tasks across engagements."}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All statuses</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {s.replaceAll("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {!isTeamMember && (
          <Select value={assignedToId} onValueChange={setAssignedToId}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All assignees</SelectItem>
              {teamMembers?.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {isPending && <ListSkeleton />}

      {isError && <ErrorState title="Couldn't load tasks" description={getErrorMessage(error)} />}

      {!isPending && !isError && tasks && tasks.length === 0 && (
        <EmptyState icon={ListChecks} title="No tasks found" description="Nothing matches these filters yet." />
      )}

      {!isPending && !isError && tasks && tasks.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Client / Service</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Due date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id} className="cursor-pointer">
                <TableCell>
                  <Link to={`/tasks/${task.id}`} className="font-medium hover:underline">
                    {task.title}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {task.engagement?.client?.name}
                  {task.engagement?.serviceType?.name ? ` · ${task.engagement.serviceType.name}` : ""}
                </TableCell>
                <TableCell>
                  <StatusBadge status={task.status} />
                </TableCell>
                <TableCell>{task.assignedTo?.name ?? "Unassigned"}</TableCell>
                <TableCell
                  className={isOverdue(task.dueDate, task.status) ? "font-medium text-destructive" : undefined}
                >
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
