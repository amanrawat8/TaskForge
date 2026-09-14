import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "@/api/dashboard.api";
import { queryKeys } from "@/lib/queryKeys";

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard(),
    queryFn: getDashboard,
  });
}
