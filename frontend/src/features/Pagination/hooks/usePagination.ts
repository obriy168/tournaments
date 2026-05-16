import { useState, useMemo } from "react";

interface UsePaginationProps<T> {
  data: T[];
  defaultPerPage?: number;
  maxPerPage?: number;
}

export function usePagination<T>({
  data,
  defaultPerPage = 15,
  maxPerPage = 15,
}: UsePaginationProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(
    Math.min(defaultPerPage, maxPerPage)
  );

  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const effectivePage = Math.min(currentPage, totalPages);

  const startIndex = (effectivePage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const paginatedData = useMemo(
    () => data.slice(startIndex, endIndex),
    [data, startIndex, endIndex]
  );

  const goToPage = (page: number) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handlePerPageChange = (value: number) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setItemsPerPage(Math.min(value, maxPerPage));
    setCurrentPage(1);
  };

  const resetPage = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setCurrentPage(1);
  };

  return {
    currentPage: effectivePage,
    itemsPerPage,
    totalItems,
    totalPages,
    startIndex,
    endIndex,
    paginatedData,
    goToPage,
    setItemsPerPage: handlePerPageChange,
    resetPage,
  };
}