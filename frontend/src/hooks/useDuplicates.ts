import { useState, useEffect, useMemo } from 'react';
import { Duplicates, getDuplicates, DuplicateMatch } from '../api';
import {
  getAllMatches,
  calculateMatchStats,
  getRelatedDocuments,
  filterMatchesByType,
  filterMatchesByCategory,
  filterMatchesByDocument,
  sortMatches,
  MatchSortBy,
  MatchStatistics,
  RelatedDocument,
} from '../utils/matchUtils';

interface UseDuplicatesOptions {
  docName: string;
  matchTypeFilter?: 'all' | 'exact' | 'simhash' | 'embedding';
  categoryFilter?: 'all' | 'cross-document' | 'within-document';
  selectedDoc?: string | null;
  sortBy?: MatchSortBy;
  sortDirection?: 'asc' | 'desc';
}

interface UseDuplicatesReturn {
  duplicates: Duplicates | null;
  matches: DuplicateMatch[];
  stats: MatchStatistics;
  relatedDocs: RelatedDocument[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * Custom hook to manage duplicate matches for a document
 */
export function useDuplicates({
  docName,
  matchTypeFilter = 'all',
  categoryFilter = 'all',
  selectedDoc = null,
  sortBy = 'sentence',
  sortDirection = 'asc',
}: UseDuplicatesOptions): UseDuplicatesReturn {
  const [duplicates, setDuplicates] = useState<Duplicates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDuplicates = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getDuplicates(docName);
      setDuplicates(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDuplicates();
  }, [docName]);

  // Calculate statistics
  const stats = useMemo(() => {
    return calculateMatchStats(duplicates);
  }, [duplicates]);

  // Get related documents
  const relatedDocs = useMemo(() => {
    return getRelatedDocuments(duplicates);
  }, [duplicates]);

  // Get filtered and sorted matches
  const matches = useMemo(() => {
    let filtered = getAllMatches(duplicates);

    // Apply filters
    filtered = filterMatchesByType(filtered, matchTypeFilter);
    filtered = filterMatchesByCategory(filtered, categoryFilter);
    filtered = filterMatchesByDocument(filtered, selectedDoc);

    // Apply sorting
    filtered = sortMatches(filtered, sortBy, sortDirection);

    return filtered;
  }, [duplicates, matchTypeFilter, categoryFilter, selectedDoc, sortBy, sortDirection]);

  return {
    duplicates,
    matches,
    stats,
    relatedDocs,
    loading,
    error,
    refresh: loadDuplicates,
  };
}

