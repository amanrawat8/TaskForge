import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUsers } from "@/features/users/useUsersQueries";
import { useReassignTask } from "@/features/tasks/useTasksQueries";
import { getErrorMessage } from "@/lib/errors";
import type { Task } from "@/api/tasks.api";

const UNASSIGNED = "__unassigned__";

export function ReassignTaskDialog({ task }: { task: Task }) {
  const [open, setOpen] = useState(false);
  const [assignedToId, setAssignedToId] = useState<string>(task.assignedToId ?? UNASSIGNED);
  const [dueDate, setDueDate] = useState<Date | undefined>(
    task.dueDate ? new Date(task.dueDate) : undefined,
  );
  const [formError, setFormError] = useState<string | null>(null);

  const { data: teamMembers, isPending: isLoadingUsers } = useUsers("TEAM_MEMBER");
  const reassign = useReassignTask();

  const reset = () => {
    setAssignedToId(task.assignedToId ?? UNASSIGNED);
    setDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
    setFormError(null);
  };

  const handleSubmit = () => {
    const nextAssignedToId = assignedToId === UNASSIGNED ? undefined : assignedToId;
    const assignedToIdChanged = nextAssignedToId !== (task.assignedToId ?? undefined);
    const dueDateChanged = dueDate?.toISOString() !== task.dueDate;

    if (!assignedToIdChanged && !dueDateChanged) {
      setFormError("Change the assignee or due date before saving.");
      return;
    }

    reassign.mutate(
      {
        id: task.id,
        input: {
          ...(assignedToIdChanged ? { assignedToId: nextAssignedToId } : {}),
          ...(dueDateChanged && dueDate ? { dueDate: dueDate.toISOString() } : {}),
        },
      },
      {
        onSuccess: () => {
          toast.success("Task updated");
          setOpen(false);
        },
        onError: (err) => setFormError(getErrorMessage(err)),
      },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Reassign
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reassign task</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Assignee</Label>
            <Select value={assignedToId} onValueChange={setAssignedToId}>
              <SelectTrigger disabled={isLoadingUsers}>
                <SelectValue placeholder="Select a team member" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                {teamMembers?.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Due date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start font-normal">
                  <CalendarIcon className="size-4" />
                  {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={dueDate} onSelect={setDueDate} />
              </PopoverContent>
            </Popover>
          </div>

          {formError && <p className="text-sm text-destructive">{formError}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button disabled={reassign.isPending} onClick={handleSubmit}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
