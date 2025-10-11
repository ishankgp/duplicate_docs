import React from 'react';

interface ComparisonHeaderProps {
  docName: string;
  onViewDocument: (docName: string) => void;
  onClose: () => void;
}

const ComparisonHeader: React.FC<ComparisonHeaderProps> = ({
  docName,
  onViewDocument,
  onClose,
}) => {
  return (
    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Duplicate Analysis
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{docName}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onViewDocument(docName)}
          className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 border border-blue-600 dark:border-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-gray-700"
        >
          View Document
        </button>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl font-bold"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default ComparisonHeader;

