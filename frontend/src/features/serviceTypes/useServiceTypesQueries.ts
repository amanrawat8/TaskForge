import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createServiceType,
  getServiceTypeById,
  listServiceTypes,
  type CreateServiceTypeInput,
} from "@/api/serviceTypes.api";
import { queryKeys } from "@/lib/queryKeys";

export function useServiceTypes() {
  return useQuery({
    queryKey: queryKeys.serviceTypes.all(),
    queryFn: listServiceTypes,
  });
}

export function useServiceType(id: string) {
  return useQuery({
    queryKey: queryKeys.serviceTypes.detail(id),
    queryFn: () => getServiceTypeById(id),
    enabled: !!id,
  });
}

export function useCreateServiceType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateServiceTypeInput) => createServiceType(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.serviceTypes.all() });
    },
  });
}
