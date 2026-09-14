import { useState } from "react";
import { ClipboardList, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { ListSkeleton } from "@/components/common/LoadingSkeleton";
import { useClients } from "@/features/clients/useClientsQueries";
import { useEngagements } from "@/features/engagements/useEngagementsQueries";
import { getErrorMessage } from "@/lib/errors";

const ALL = "__all__";

export function EngagementsListPage() {
  const [clientId, setClientId] = useState<string>(ALL);
  const { data: clients } = useClients();
  const {
    data: engagements,
    isPending,
    isError,
    error,
  } = useEngagements(clientId !== ALL ? { clientId } : {});

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl font-semibold">Engagements</h1>
          <p className="text-sm text-muted-foreground">
            A client's service for a specific period.
          </p>
        </div>
        <Button asChild size="sm">
          <Link to="/engagements/new">
            <Plus className="size-4" />
            New engagement
          </Link>
        </Button>
      </div>

      <Select value={clientId} onValueChange={setClientId}>
        <SelectTrigger className="w-56">
          <SelectValue placeholder="Filter by client" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All clients</SelectItem>
          {clients?.map((client) => (
            <SelectItem key={client.id} value={client.id}>
              {client.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isPending && <ListSkeleton />}

      {isError && (
        <ErrorState title="Couldn't load engagements" description={getErrorMessage(error)} />
      )}

      {!isPending && !isError && engagements && engagements.length === 0 && (
        <EmptyState
          icon={ClipboardList}
          title="No engagements yet"
          description="Create one to generate tasks for a client's service period."
        />
      )}

      {!isPending && !isError && engagements && engagements.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Service type</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {engagements.map((engagement) => (
              <TableRow key={engagement.id}>
                <TableCell>
                  <Link
                    to={`/engagements/${engagement.id}`}
                    className="font-medium hover:underline"
                  >
                    {engagement.client?.name}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {engagement.serviceType?.name}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(engagement.periodStart).toLocaleDateString()} –{" "}
                  {new Date(engagement.periodEnd).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{engagement.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
