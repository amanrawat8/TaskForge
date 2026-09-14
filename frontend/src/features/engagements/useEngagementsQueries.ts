import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createEngagement,
  generateNextEngagement,
  getEngagementById,
  listEngagements,
  type CreateEngagementInput,
} from "@/api/engagements.api";
import { queryKeys } from "@/lib/queryKeys";

export function useEngagements(filters: { clientId?: string } = {}) {
  return useQuery({
    queryKey: queryKeys.engagements.all(filters),
    queryFn: () => listEngagements(filters),
  });
}

export function useEngagement(id: string) {
  return useQuery({
    queryKey: queryKeys.engagements.detail(id),
    queryFn: () => getEngagementById(id),
    enabled: !!id,
  });
}

export function useCreateEngagement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateEngagementInput) => createEngagement(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["engagements"] });
    },
  });
}

export function useGenerateNextEngagement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => generateNextEngagement(id),
    onSuccess: (_engagement, id) => {
      queryClient.invalidateQueries({ queryKey: ["engagements"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.engagements.detail(id) });
    },
  });
}
