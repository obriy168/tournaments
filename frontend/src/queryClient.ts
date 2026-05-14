import { QueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 15,
      gcTime: 1000 * 60 * 10,
      retry: (failureCount, error) => {
        const axiosError = error as AxiosError | undefined;
        if (axiosError?.response?.status === 401) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchInterval: 1000 * 30,
    },
    mutations: {
      retry: 1,
    },
  },
});