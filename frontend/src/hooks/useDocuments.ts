import { useState, useEffect, useMemo } from 'react';
import { DocumentMetrics, getDocuments } from '../api';
import { sortDocuments, filterByMatchTypes } from '../utils/documentUtils';

interface UseDocumentsOptions {
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  minSimilarity: number;
  searchTerm: string;
  selectedMatchTypes: string[];
  refreshTrigger?: number;
}

interface UseDocumentsReturn {
  documents: DocumentMetrics[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * Custom hook to manage document fetching, sorting, and filtering
 */
export function useDocuments({
  sortBy,
  sortDirection,
  minSimilarity,
  searchTerm,
  selectedMatchTypes,
  refreshTrigger = 0,
}: UseDocumentsOptions): UseDocumentsReturn {
  const [rawDocuments, setRawDocuments] = useState<DocumentMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounced search term
  const debouncedSearch = useMemo(() => searchTerm, [searchTerm]);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDocuments(
        sortBy,
        minSimilarity,
        debouncedSearch || undefined
      );
      setRawDocuments(data.documents);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchDocuments();
    }, 300);
    return () => clearTimeout(handler);
  }, [sortBy, minSimilarity, debouncedSearch, refreshTrigger]);

  // Apply sorting and filtering
  const documents = useMemo(() => {
    let filtered = [...rawDocuments];

    // Apply match type filter
    filtered = filterByMatchTypes(filtered, selectedMatchTypes);

    // Sort documents
    filtered = sortDocuments(filtered, sortBy, sortDirection);

    return filtered;
  }, [rawDocuments, selectedMatchTypes, sortBy, sortDirection]);

  return {
    documents,
    loading,
    error,
    refresh: fetchDocuments,
  };
}

