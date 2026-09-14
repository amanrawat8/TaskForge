import { Users as UsersIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { CreateUserDialog } from "@/features/users/CreateUserDialog";
import { useUsers } from "@/features/users/useUsersQueries";
import { getErrorMessage } from "@/lib/errors";
import { canManageUsers } from "@/lib/roles";

export function UsersListPage() {
  const { session } = useAuth();
  const { data: users, isPending, isError, error } = useUsers();
  const canCreate = session ? canManageUsers(session.user.role) : false;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl font-semibold">Users</h1>
          <p className="text-sm text-muted-foreground">People with access to this workspace.</p>
        </div>
        {canCreate && <CreateUserDialog />}
      </div>

      {isPending && <ListSkeleton />}

      {isError && <ErrorState title="Couldn't load users" description={getErrorMessage(error)} />}

      {!isPending && !isError && users && users.length === 0 && (
        <EmptyState icon={UsersIcon} title="No users yet" />
      )}

      {!isPending && !isError && users && users.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                <TableCell>
                  <Badge variant="outline">{user.role.replaceAll("_", " ")}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
