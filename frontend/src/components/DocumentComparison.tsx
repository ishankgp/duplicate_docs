import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import ComparisonHeader from './ComparisonHeader';
import ComparisonStats from './ComparisonStats';
import RelatedDocumentsSidebar from './RelatedDocumentsSidebar';
import MatchFilters from './MatchFilters';
import MatchesList from './MatchesList';
import { useDuplicates } from '../hooks/useDuplicates';
import { usePagination } from '../hooks/usePagination';
import { MatchSortBy } from '../utils/matchUtils';

interface DocumentComparisonProps {
  docName: string;
  onClose: () => void;
  onViewDocument: (docName: string) => void;
}

const DocumentComparison: React.FC<DocumentComparisonProps> = ({ 
  docName, 
  onClose,
  onViewDocument 
}) => {
  const [matchTypeFilter, setMatchTypeFilter] = useState<'all' | 'exact' | 'simhash' | 'embedding'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'cross-document' | 'within-document'>('all');
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<MatchSortBy>('sentence');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Use custom hooks
  const { matches, stats, relatedDocs, loading, error } = useDuplicates({
    docName,
    matchTypeFilter,
    categoryFilter,
    selectedDoc,
    sortBy,
    sortDirection,
  });

  const { paginatedData, currentPage, goToPage } = usePagination(matches, {
    itemsPerPage: 100,
    resetTriggers: [matchTypeFilter, categoryFilter, selectedDoc, sortBy],
  });

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-2xl w-full">
          <LoadingSpinner message="Loading duplicates..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-2xl w-full">
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4 text-red-700 dark:text-red-200">
            <h3 className="font-bold mb-2">Error loading duplicates</h3>
            <p>{error}</p>
          </div>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-7xl w-full h-[90vh] flex flex-col">
        <ComparisonHeader
          docName={docName}
          onViewDocument={onViewDocument}
          onClose={onClose}
        />

        <ComparisonStats stats={stats} />

        <div className="flex-1 flex overflow-hidden">
          <RelatedDocumentsSidebar
            relatedDocs={relatedDocs}
            selectedDoc={selectedDoc}
            onSelectDoc={setSelectedDoc}
          />

          <div className="flex-1 overflow-y-auto">
            <MatchFilters
              matchTypeFilter={matchTypeFilter}
              onMatchTypeChange={setMatchTypeFilter}
              categoryFilter={categoryFilter}
              onCategoryChange={setCategoryFilter}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              sortDirection={sortDirection}
              onSortDirectionToggle={() =>
                setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
              }
            />

            <div id="matches-list" className="p-4 space-y-3">
              <MatchesList
                paginatedData={paginatedData}
                currentDoc={docName}
                currentPage={currentPage}
                onPageChange={goToPage}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentComparison;

