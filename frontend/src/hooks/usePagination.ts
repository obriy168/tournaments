import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import type { PaginationParams, PaginatedResponse, PaginationMeta } from "@/services/api";

interface UsePaginationOptions<T> {
  queryKey: readonly unknown[];
  fetchFn: (params: PaginationParams) => Promise<PaginatedResponse<T>>;
  initialPage?: number;
  pageSize?: number;
  enabled?: boolean;
  extraDeps?: unknown[];
}

interface UsePaginationResult<T> {
  data: T[];
  meta: PaginationMeta | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  refetch: () => void;
}

export function usePagination<T>({
  queryKey,
  fetchFn,
  initialPage = 1,
  pageSize = 15,
  enabled = true,
  extraDeps = [],
}: UsePaginationOptions<T>): UsePaginationResult<T> {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(pageSize);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [...queryKey, page, limit, ...extraDeps],
    queryFn: () => fetchFn({ page, limit }),
    enabled,
  });

  const totalPages = data?.meta?.pages ?? 0;

  const nextPage = useCallback(() => {
    setPage((currentPage) => {
      if (currentPage < totalPages) {
        return currentPage + 1;
      }
      return currentPage;
    });
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setPage((currentPage) => {
      if (currentPage > 1) {
        return currentPage - 1;
      }
      return currentPage;
    });
  }, []);

  const setPageSize = useCallback((size: number) => {
    setLimit(size);
    setPage(1);
  }, []);

  const hasNextPage = page < totalPages && totalPages > 0;
  const hasPrevPage = page > 1;

  return {
    data: data?.items ?? [],
    meta: data?.meta ?? null,
    isLoading,
    isError,
    error,
    page,
    pageSize: limit,
    setPage,
    setPageSize,
    nextPage,
    prevPage,
    hasNextPage,
    hasPrevPage,
    refetch,
  };
}