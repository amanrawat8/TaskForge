import { Building2 } from "lucide-react";
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
import { CreateClientDialog } from "@/features/clients/CreateClientDialog";
import { useClients } from "@/features/clients/useClientsQueries";
import { useAuth } from "@/features/auth/useAuthStore";
import { getErrorMessage } from "@/lib/errors";
import { canManageClients } from "@/lib/roles";

export function ClientsListPage() {
  const { session } = useAuth();
  const { data: clients, isPending, isError, error } = useClients();
  const canCreate = session ? canManageClients(session.user.role) : false;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl font-semibold">Clients</h1>
          <p className="text-sm text-muted-foreground">Organizations you provide services to.</p>
        </div>
        {canCreate && <CreateClientDialog />}
      </div>

      {isPending && <ListSkeleton />}

      {isError && (
        <ErrorState title="Couldn't load clients" description={getErrorMessage(error)} />
      )}

      {!isPending && !isError && clients && clients.length === 0 && (
        <EmptyState
          icon={Building2}
          title="No clients yet"
          description="Add your first client to start creating engagements."
        />
      )}

      {!isPending && !isError && clients && clients.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Added</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(client.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
