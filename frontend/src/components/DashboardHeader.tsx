import React from 'react';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import ExportMenu from './ExportMenu';
import { DocumentMetrics } from '../api';

interface DashboardHeaderProps {
  documentCount: number;
  documents: DocumentMetrics[];
  showVisualization: boolean;
  onToggleVisualization: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  documentCount,
  documents,
  showVisualization,
  onToggleVisualization,
}) => {
  return (
    <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Document Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Found {documentCount} document{documentCount !== 1 ? 's' : ''} with duplicate content
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleVisualization}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
            showVisualization
              ? 'bg-purple-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          <ChartBarIcon className="w-5 h-5" />
          {showVisualization ? 'Hide Charts' : 'Show Charts'}
        </button>
        <ExportMenu documents={documents} />
      </div>
    </div>
  );
};

export default DashboardHeader;

