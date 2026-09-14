import { Briefcase, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { ListSkeleton } from "@/components/common/LoadingSkeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/features/auth/useAuthStore";
import { useServiceTypes } from "@/features/serviceTypes/useServiceTypesQueries";
import { getErrorMessage } from "@/lib/errors";
import { canManageServiceTypes } from "@/lib/roles";

export function ServiceTypesListPage() {
  const { session } = useAuth();
  const { data: serviceTypes, isPending, isError, error } = useServiceTypes();
  const canCreate = session ? canManageServiceTypes(session.user.role) : false;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl font-semibold">Service Types</h1>
          <p className="text-sm text-muted-foreground">
            Reusable playbooks that generate an engagement's tasks.
          </p>
        </div>
        {canCreate && (
          <Button asChild size="sm">
            <Link to="/service-types/new">
              <Plus className="size-4" />
              New service type
            </Link>
          </Button>
        )}
      </div>

      {isPending && <ListSkeleton />}

      {isError && (
        <ErrorState title="Couldn't load service types" description={getErrorMessage(error)} />
      )}

      {!isPending && !isError && serviceTypes && serviceTypes.length === 0 && (
        <EmptyState
          icon={Briefcase}
          title="No service types yet"
          description="Create one to define the tasks generated for each engagement."
        />
      )}

      {!isPending && !isError && serviceTypes && serviceTypes.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Recurrence</TableHead>
              <TableHead>Task templates</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {serviceTypes.map((serviceType) => (
              <TableRow key={serviceType.id}>
                <TableCell>
                  <Link
                    to={`/service-types/${serviceType.id}`}
                    className="font-medium hover:underline"
                  >
                    {serviceType.name}
                  </Link>
                </TableCell>
                <TableCell>
                  {serviceType.isRecurring ? (
                    <Badge variant="outline">{serviceType.recurrenceUnit}</Badge>
                  ) : (
                    <span className="text-muted-foreground">One-time</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {serviceType.taskTemplates.length}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
