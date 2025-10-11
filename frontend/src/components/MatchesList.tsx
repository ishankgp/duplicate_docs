import React from 'react';
import SentencePair from './SentencePair';
import { DuplicateMatch } from '../api';
import { PaginationResult } from '../utils/matchUtils';

interface MatchesListProps {
  paginatedData: PaginationResult<DuplicateMatch>;
  currentDoc: string;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const MatchesList: React.FC<MatchesListProps> = ({
  paginatedData,
  currentDoc,
  currentPage,
  onPageChange,
}) => {
  const { items, totalPages, startIndex, endIndex, totalItems } = paginatedData;

  if (totalItems === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        No matches found with current filters
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2 mt-3 text-sm text-gray-600 dark:text-gray-400">
        <div>
          Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of{' '}
          {totalItems.toLocaleString()} match{totalItems !== 1 ? 'es' : ''}
        </div>
      </div>

      {items.map((match, idx) => (
        <SentencePair
          key={`${match.type}-${match.sent_id}-${match.other_sent_id}-${idx}`}
          match={match}
          currentDoc={currentDoc}
          onClick={() => {}}
        />
      ))}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of{' '}
            {totalItems.toLocaleString()}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              ← Prev
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Page {currentPage} of {totalPages.toLocaleString()}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default MatchesList;

