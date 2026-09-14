import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createUser, listUsers, type CreateUserInput } from "@/api/users.api";
import { queryKeys } from "@/lib/queryKeys";
import type { Role } from "@/lib/types";

export function useUsers(role?: Role, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.users.all(role),
    queryFn: () => listUsers(role),
    enabled: options?.enabled ?? true,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateUserInput) => createUser(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
