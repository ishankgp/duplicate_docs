import React from 'react';
import TooltipInfo from './TooltipInfo';
import { MatchSortBy } from '../utils/matchUtils';

interface MatchFiltersProps {
  matchTypeFilter: 'all' | 'exact' | 'simhash' | 'embedding';
  onMatchTypeChange: (type: 'all' | 'exact' | 'simhash' | 'embedding') => void;
  categoryFilter: 'all' | 'cross-document' | 'within-document';
  onCategoryChange: (category: 'all' | 'cross-document' | 'within-document') => void;
  sortBy: MatchSortBy;
  onSortByChange: (sortBy: MatchSortBy) => void;
  sortDirection: 'asc' | 'desc';
  onSortDirectionToggle: () => void;
}

const MatchFilters: React.FC<MatchFiltersProps> = ({
  matchTypeFilter,
  onMatchTypeChange,
  categoryFilter,
  onCategoryChange,
  sortBy,
  onSortByChange,
  sortDirection,
  onSortDirectionToggle,
}) => {
  return (
    <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 z-10">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
            Filter:
            <TooltipInfo text="Filter matches by detection method and category." />
          </span>
          <button
            onClick={() => onMatchTypeChange('all')}
            className={`px-3 py-1 text-sm rounded ${
              matchTypeFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => onMatchTypeChange('exact')}
            className={`px-3 py-1 text-sm rounded ${
              matchTypeFilter === 'exact'
                ? 'bg-red-600 text-white'
                : 'bg-white dark:bg-gray-800 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900'
            }`}
          >
            Exact
          </button>
          <button
            onClick={() => onMatchTypeChange('simhash')}
            className={`px-3 py-1 text-sm rounded ${
              matchTypeFilter === 'simhash'
                ? 'bg-orange-600 text-white'
                : 'bg-white dark:bg-gray-800 border border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900'
            }`}
          >
            Near-Dup
          </button>
          <button
            onClick={() => onMatchTypeChange('embedding')}
            className={`px-3 py-1 text-sm rounded ${
              matchTypeFilter === 'embedding'
                ? 'bg-yellow-600 text-white'
                : 'bg-white dark:bg-gray-800 border border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900'
            }`}
          >
            Semantic
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
            Sort:
            <TooltipInfo text="Change the order of results (by sentence, type, or similarity score)." />
          </span>
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as MatchSortBy)}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-blue-500"
          >
            <option value="sentence">By Sentence ID</option>
            <option value="type">By Match Type</option>
            <option value="score">By Similarity Score</option>
          </select>
          <button
            onClick={onSortDirectionToggle}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Toggle sort direction"
          >
            {sortDirection === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
          Category:
          <TooltipInfo text="Filter matches occurring within the same document or across documents." />
        </span>
        <button
          onClick={() => onCategoryChange('all')}
          className={`px-3 py-1 text-sm rounded ${
            categoryFilter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          All
        </button>
        <button
          onClick={() => onCategoryChange('cross-document')}
          className={`px-3 py-1 text-sm rounded ${
            categoryFilter === 'cross-document'
              ? 'bg-green-600 text-white'
              : 'bg-white dark:bg-gray-800 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900'
          }`}
        >
          Cross-Document
        </button>
        <button
          onClick={() => onCategoryChange('within-document')}
          className={`px-3 py-1 text-sm rounded ${
            categoryFilter === 'within-document'
              ? 'bg-purple-600 text-white'
              : 'bg-white dark:bg-gray-800 border border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900'
          }`}
        >
          Within-Document
        </button>
      </div>
    </div>
  );
};

export default MatchFilters;

