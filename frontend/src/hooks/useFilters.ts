import { useState, useEffect } from 'react';
import { presetFilters } from '../utils/documentUtils';

export interface FilterState {
  searchTerm: string;
  minSimilarity: number;
  selectedMatchTypes: string[];
  activePreset: string | null;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  viewMode: 'grid' | 'table';
}

interface UseFiltersOptions {
  initialSortBy?: string;
  initialSortDirection?: 'asc' | 'desc';
  initialViewMode?: 'grid' | 'table';
  persistToLocalStorage?: boolean;
  localStoragePrefix?: string;
}

interface UseFiltersReturn {
  filters: FilterState;
  setSearchTerm: (term: string) => void;
  setMinSimilarity: (value: number) => void;
  setSortBy: (value: string) => void;
  setSortDirection: (direction: 'asc' | 'desc') => void;
  setViewMode: (mode: 'grid' | 'table') => void;
  toggleMatchType: (type: string) => void;
  applyPreset: (presetId: string, minValue: number) => void;
  clearFilters: () => void;
}

/**
 * Custom hook to manage filter state with localStorage persistence
 */
export function useFilters({
  initialSortBy = 'similarity_score',
  initialSortDirection = 'desc',
  initialViewMode = 'grid',
  persistToLocalStorage = true,
  localStoragePrefix = 'dashboard',
}: UseFiltersOptions = {}): UseFiltersReturn {
  const [searchTerm, setSearchTermState] = useState<string>('');
  const [minSimilarity, setMinSimilarityState] = useState<number>(0);
  const [selectedMatchTypes, setSelectedMatchTypes] = useState<string[]>([]);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [sortBy, setSortByState] = useState<string>(initialSortBy);
  const [sortDirection, setSortDirectionState] = useState<'asc' | 'desc'>(initialSortDirection);
  const [viewMode, setViewModeState] = useState<'grid' | 'table'>(initialViewMode);

  // Load from localStorage on mount
  useEffect(() => {
    if (!persistToLocalStorage) return;

    const storedSort = localStorage.getItem(`${localStoragePrefix}Sort`);
    const storedDirection = localStorage.getItem(`${localStoragePrefix}SortDirection`);
    const storedView = localStorage.getItem(`${localStoragePrefix}ViewMode`);

    if (storedSort) setSortByState(storedSort);
    if (storedDirection === 'asc' || storedDirection === 'desc') {
      setSortDirectionState(storedDirection);
    }
    if (storedView === 'grid' || storedView === 'table') {
      setViewModeState(storedView);
    }
  }, [persistToLocalStorage, localStoragePrefix]);

  // Persist to localStorage when values change
  useEffect(() => {
    if (!persistToLocalStorage) return;

    localStorage.setItem(`${localStoragePrefix}Sort`, sortBy);
    localStorage.setItem(`${localStoragePrefix}SortDirection`, sortDirection);
    localStorage.setItem(`${localStoragePrefix}ViewMode`, viewMode);
  }, [sortBy, sortDirection, viewMode, persistToLocalStorage, localStoragePrefix]);

  // Auto-clear active preset when similarity changes manually
  useEffect(() => {
    if (minSimilarity === 0) {
      setActivePreset(null);
    }
  }, [minSimilarity]);

  const toggleMatchType = (type: string) => {
    setSelectedMatchTypes((prev) =>
      prev.includes(type) ? prev.filter((item) => item !== type) : [...prev, type]
    );
  };

  const applyPreset = (presetId: string, minValue: number) => {
    setActivePreset(presetId);
    setMinSimilarityState(minValue);
  };

  const clearFilters = () => {
    setSearchTermState('');
    setMinSimilarityState(0);
    setSelectedMatchTypes([]);
    setActivePreset(null);
  };

  const setSearchTerm = (term: string) => {
    setSearchTermState(term);
  };

  const setMinSimilarity = (value: number) => {
    setMinSimilarityState(value);
    // Check if this matches a preset
    const matchingPreset = presetFilters.find((p) => p.minSimilarity === value);
    if (matchingPreset) {
      setActivePreset(matchingPreset.id);
    } else {
      setActivePreset(null);
    }
  };

  const setSortBy = (value: string) => {
    setSortByState(value);
  };

  const setSortDirection = (direction: 'asc' | 'desc') => {
    setSortDirectionState(direction);
  };

  const setViewMode = (mode: 'grid' | 'table') => {
    setViewModeState(mode);
  };

  const filters: FilterState = {
    searchTerm,
    minSimilarity,
    selectedMatchTypes,
    activePreset,
    sortBy,
    sortDirection,
    viewMode,
  };

  return {
    filters,
    setSearchTerm,
    setMinSimilarity,
    setSortBy,
    setSortDirection,
    setViewMode,
    toggleMatchType,
    applyPreset,
    clearFilters,
  };
}

