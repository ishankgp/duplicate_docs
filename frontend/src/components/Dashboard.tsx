import React, { useState, useEffect } from 'react';
import { DocumentMetrics } from '../api';
import SkeletonCard from './SkeletonCard';
import EmptyState from './EmptyState';
import ErrorMessage from './ErrorMessage';
import StatisticsOverview from './StatisticsOverview';
import DataVisualization from './DataVisualization';
import DashboardHeader from './DashboardHeader';
import DashboardFilters from './DashboardFilters';
import DocumentGrid from './DocumentGrid';
import DocumentTable from './DocumentTable';
import { useDocuments } from '../hooks/useDocuments';
import { useFilters } from '../hooks/useFilters';

interface DashboardProps {
  onViewDetails: (docName: string) => void;
  onViewDocument: (docName: string) => void;
  refreshTrigger?: number;
  searchRef?: React.RefObject<HTMLInputElement>;
  viewModeToggle?: 'grid' | 'table';
}

const Dashboard: React.FC<DashboardProps> = ({ 
  onViewDetails, 
  onViewDocument,
  refreshTrigger = 0,
  searchRef,
  viewModeToggle
}) => {
  const [showVisualization, setShowVisualization] = useState(false);

  // Use custom hooks for state management
  const {
    filters,
    setSearchTerm,
    setMinSimilarity,
    setSortBy,
    setSortDirection,
    setViewMode,
    toggleMatchType,
    applyPreset,
    clearFilters,
  } = useFilters();

  const { documents, loading, error, refresh } = useDocuments({
    sortBy: filters.sortBy,
    sortDirection: filters.sortDirection,
    minSimilarity: filters.minSimilarity,
    searchTerm: filters.searchTerm,
    selectedMatchTypes: filters.selectedMatchTypes,
    refreshTrigger,
  });

  // Sync external viewModeToggle
  useEffect(() => {
    if (viewModeToggle) {
      setViewMode(viewModeToggle);
    }
  }, [viewModeToggle, setViewMode]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refresh} />;
  }

  if (documents.length === 0) {
    return (
      <EmptyState
        title="No documents found"
        description={
          filters.searchTerm
            ? 'Try adjusting your search or filters.'
            : 'No analysis results available. Run an analysis first.'
        }
        actionLabel="Clear filters"
        onAction={clearFilters}
      />
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg animate-fade-in">
      <DashboardHeader
        documentCount={documents.length}
        documents={documents}
        showVisualization={showVisualization}
        onToggleVisualization={() => setShowVisualization(!showVisualization)}
      />

      {showVisualization && <DataVisualization documents={documents} />}

      <StatisticsOverview documents={documents} />

      <DashboardFilters
        searchTerm={filters.searchTerm}
        onSearchChange={setSearchTerm}
        searchRef={searchRef}
        sortBy={filters.sortBy}
        onSortByChange={setSortBy}
        sortDirection={filters.sortDirection}
        onSortDirectionToggle={() =>
          setSortDirection(filters.sortDirection === 'asc' ? 'desc' : 'asc')
        }
        minSimilarity={filters.minSimilarity}
        onMinSimilarityChange={setMinSimilarity}
        activePreset={filters.activePreset}
        onPresetApply={applyPreset}
        selectedMatchTypes={filters.selectedMatchTypes}
        onMatchTypeToggle={toggleMatchType}
        onClearFilters={clearFilters}
        viewMode={filters.viewMode}
        onViewModeChange={setViewMode}
      />

      {filters.viewMode === 'grid' ? (
        <DocumentGrid
          documents={documents}
          onViewDetails={onViewDetails}
          onViewDocument={onViewDocument}
        />
      ) : (
        <DocumentTable
          documents={documents}
          onViewDetails={onViewDetails}
          onViewDocument={onViewDocument}
        />
      )}
    </div>
  );
};

export default Dashboard;

