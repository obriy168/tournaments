import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 15,
      gcTime: 1000 * 60 * 10,
      retry: 2,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchInterval: 1000 * 30,
    },
    mutations: {
      retry: 1,
    },
  },
});