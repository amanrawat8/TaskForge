import { QueryClient } from "@tanstack/react-query";
import axios from "axios";

const NO_RETRY_STATUSES = new Set([401, 403, 404]);

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        const status = axios.isAxiosError(error) ? error.response?.status : undefined;
        if (status !== undefined && NO_RETRY_STATUSES.has(status)) return false;
        return failureCount < 2;
      },
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
