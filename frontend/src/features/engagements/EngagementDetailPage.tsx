import { ArrowLeft } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ErrorState } from "@/components/common/ErrorState";
import { ListSkeleton } from "@/components/common/LoadingSkeleton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useEngagement, useGenerateNextEngagement } from "@/features/engagements/useEngagementsQueries";
import { getErrorMessage, getErrorStatus } from "@/lib/errors";

export function EngagementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: engagement, isPending, isError, error } = useEngagement(id!);
  const generateNext = useGenerateNextEngagement();

  if (isPending) return <ListSkeleton rows={6} />;

  if (isError) {
    const status = getErrorStatus(error);
    return (
      <ErrorState
        title={status === 404 ? "Engagement not found" : "Couldn't load engagement"}
        description={status === 404 ? undefined : getErrorMessage(error)}
        backTo="/engagements"
        backLabel="Back to engagements"
      />
    );
  }

  if (!engagement) return null;

  const isRecurring = engagement.serviceType?.isRecurring ?? false;

  const handleGenerateNext = () => {
    generateNext.mutate(engagement.id, {
      onSuccess: (next) => {
        toast.success("Next period generated");
        navigate(`/engagements/${next.id}`);
      },
      onError: (err) => toast.error(getErrorMessage(err)),
    });
  };

  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <Link
        to="/engagements"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to engagements
      </Link>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg">{engagement.client?.name}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{engagement.serviceType?.name}</p>
          </div>
          <Badge variant="outline">{engagement.status}</Badge>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Period</p>
              <p className="font-medium">
                {new Date(engagement.periodStart).toLocaleDateString()} –{" "}
                {new Date(engagement.periodEnd).toLocaleDateString()}
              </p>
            </div>
          </div>

          {isRecurring ? (
            <Button
              className="w-fit"
              variant="outline"
              disabled={generateNext.isPending}
              onClick={handleGenerateNext}
            >
              Generate next period
            </Button>
          ) : (
            <p className="text-xs text-muted-foreground">
              This service type is one-time, so no further periods can be generated.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {!engagement.tasks || engagement.tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tasks generated for this period.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Due date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {engagement.tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <Link to={`/tasks/${task.id}`} className="font-medium hover:underline">
                        {task.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={task.status} />
                    </TableCell>
                    <TableCell>{task.assignedTo?.name ?? "Unassigned"}</TableCell>
                    <TableCell>
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
