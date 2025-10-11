import React from 'react';
import TooltipInfo from './TooltipInfo';
import { sortOptions, matchTypeOptions, presetFilters } from '../utils/documentUtils';

interface DashboardFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  searchRef?: React.RefObject<HTMLInputElement>;
  sortBy: string;
  onSortByChange: (value: string) => void;
  sortDirection: 'asc' | 'desc';
  onSortDirectionToggle: () => void;
  minSimilarity: number;
  onMinSimilarityChange: (value: number) => void;
  activePreset: string | null;
  onPresetApply: (presetId: string, minValue: number) => void;
  selectedMatchTypes: string[];
  onMatchTypeToggle: (type: string) => void;
  onClearFilters: () => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
}

const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  searchTerm,
  onSearchChange,
  searchRef,
  sortBy,
  onSortByChange,
  sortDirection,
  onSortDirectionToggle,
  minSimilarity,
  onMinSimilarityChange,
  activePreset,
  onPresetApply,
  selectedMatchTypes,
  onMatchTypeToggle,
  onClearFilters,
  viewMode,
  onViewModeChange,
}) => {
  return (
    <div className="mb-6 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
      {/* Search, Sort, Min Similarity Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
            Search Documents
            <TooltipInfo text="Quickly find documents by filename." />
          </label>
          <input
            ref={searchRef}
            type="text"
            placeholder="Search by filename... (Ctrl+K)"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
            Sort By
            <TooltipInfo text="Change the ordering of documents in the dashboard." />
          </label>
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              onClick={onSortDirectionToggle}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Toggle sort direction"
            >
              {sortDirection === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
            Min Similarity
            <TooltipInfo text="Filter documents by minimum overall similarity score." />
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="5"
            value={minSimilarity}
            onChange={(e) => onMinSimilarityChange(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Preset Filters Row */}
      <div className="flex flex-wrap gap-2 text-xs">
        {presetFilters.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onPresetApply(preset.id, preset.minSimilarity)}
            className={`px-3 py-1 rounded-full border ${
              activePreset === preset.id
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {preset.label}
          </button>
        ))}
        <button
          onClick={onClearFilters}
          className="px-3 py-1 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Clear Filters
        </button>
      </div>

      {/* Match Type Filters Row */}
      <div className="flex flex-wrap gap-2 text-xs">
        {matchTypeOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => onMatchTypeToggle(option.id)}
            className={`px-3 py-1 rounded-full border ${
              selectedMatchTypes.includes(option.id)
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Active Filters & View Mode Row */}
      <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
        <div className="flex flex-wrap gap-2">
          {selectedMatchTypes.map((type) => {
            const option = matchTypeOptions.find((opt) => opt.id === type);
            if (!option) return null;
            return (
              <span
                key={type}
                className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-full"
              >
                {option.label}
                <button
                  className="ml-2 text-blue-600 dark:text-blue-300"
                  onClick={() => onMatchTypeToggle(type)}
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            View Mode
            <TooltipInfo text="Switch between card grid and table view." />
          </span>
          <div className="inline-flex rounded-lg border border-gray-300 dark:border-gray-600">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Grid View
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Table View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardFilters;

