import { useState, useEffect, useMemo } from 'react';
import { paginate, PaginationResult } from '../utils/matchUtils';

interface UsePaginationOptions {
  itemsPerPage?: number;
  resetTriggers?: any[];
}

interface UsePaginationReturn<T> {
  currentPage: number;
  itemsPerPage: number;
  paginatedData: PaginationResult<T>;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  setItemsPerPage: (count: number) => void;
}

/**
 * Custom hook to manage pagination state
 */
export function usePagination<T>(
  items: T[],
  { itemsPerPage: initialItemsPerPage = 100, resetTriggers = [] }: UsePaginationOptions = {}
): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPageState] = useState(initialItemsPerPage);

  // Reset to page 1 when filters or items change
  useEffect(() => {
    setCurrentPage(1);
  }, [...resetTriggers, items.length]);

  // Calculate paginated data
  const paginatedData = useMemo(() => {
    return paginate(items, currentPage, itemsPerPage);
  }, [items, currentPage, itemsPerPage]);

  const goToPage = (page: number) => {
    const totalPages = paginatedData.totalPages;
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => {
    goToPage(currentPage + 1);
  };

  const prevPage = () => {
    goToPage(currentPage - 1);
  };

  const goToFirstPage = () => {
    goToPage(1);
  };

  const goToLastPage = () => {
    goToPage(paginatedData.totalPages);
  };

  const setItemsPerPage = (count: number) => {
    setItemsPerPageState(count);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  return {
    currentPage,
    itemsPerPage,
    paginatedData,
    goToPage,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage,
    setItemsPerPage,
  };
}

