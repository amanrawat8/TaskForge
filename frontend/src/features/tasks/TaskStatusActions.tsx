import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/features/auth/useAuthStore";
import { getAvailableTransitions, statusLabel } from "@/features/tasks/task-status";
import { useUpdateTaskStatus } from "@/features/tasks/useTasksQueries";
import { getErrorMessage } from "@/lib/errors";
import type { Task } from "@/api/tasks.api";
import type { TaskStatus } from "@/lib/types";

const NOTE_PROMPTED_STATUSES = new Set<TaskStatus>(["CHANGES_REQUESTED", "WAITING_FOR_CLIENT"]);

export function TaskStatusActions({ task }: { task: Task }) {
  const { session } = useAuth();
  const updateStatus = useUpdateTaskStatus();
  const [pendingStatus, setPendingStatus] = useState<TaskStatus | null>(null);
  const [note, setNote] = useState("");

  if (!session) return null;

  const transitions = getAvailableTransitions(task, session.user);
  if (transitions.length === 0) return null;

  const runTransition = (status: TaskStatus, transitionNote?: string) => {
    updateStatus.mutate(
      { id: task.id, status, note: transitionNote },
      {
        onError: (err) => toast.error(getErrorMessage(err)),
        onSuccess: () => toast.success(`Task moved to ${statusLabel(status).toLowerCase()}`),
      },
    );
  };

  const handleClick = (status: TaskStatus) => {
    if (NOTE_PROMPTED_STATUSES.has(status)) {
      setPendingStatus(status);
      setNote("");
      return;
    }
    runTransition(status);
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {transitions.map((status) => (
          <Button
            key={status}
            size="sm"
            variant={status === "CHANGES_REQUESTED" ? "destructive" : "secondary"}
            disabled={updateStatus.isPending}
            onClick={() => handleClick(status)}
          >
            {statusLabel(status)}
          </Button>
        ))}
      </div>

      <Dialog open={pendingStatus !== null} onOpenChange={(open) => !open && setPendingStatus(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingStatus && `Move to ${statusLabel(pendingStatus).toLowerCase()}`}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="status-note">Note (optional)</Label>
            <Textarea
              id="status-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add context for this status change…"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingStatus(null)}>
              Cancel
            </Button>
            <Button
              disabled={updateStatus.isPending}
              onClick={() => {
                if (!pendingStatus) return;
                runTransition(pendingStatus, note.trim() || undefined);
                setPendingStatus(null);
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
