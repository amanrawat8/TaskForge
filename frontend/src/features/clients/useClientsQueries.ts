import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient, listClients } from "@/api/clients.api";
import { queryKeys } from "@/lib/queryKeys";

export function useClients() {
  return useQuery({
    queryKey: queryKeys.clients.all(),
    queryFn: listClients,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => createClient(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.all() });
    },
  });
}
