import React from 'react';
import { RelatedDocument } from '../utils/matchUtils';

interface RelatedDocumentsSidebarProps {
  relatedDocs: RelatedDocument[];
  selectedDoc: string | null;
  onSelectDoc: (doc: string | null) => void;
}

const RelatedDocumentsSidebar: React.FC<RelatedDocumentsSidebarProps> = ({
  relatedDocs,
  selectedDoc,
  onSelectDoc,
}) => {
  return (
    <div className="w-64 border-r border-gray-200 dark:border-gray-700 overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="p-4">
        <h3 className="font-bold text-gray-900 dark:text-white mb-3">
          Related Documents ({relatedDocs.length})
        </h3>

        <div className="space-y-2">
          <button
            onClick={() => onSelectDoc(null)}
            className={`w-full text-left px-3 py-2 rounded text-sm ${
              selectedDoc === null
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            All Documents
          </button>

          {relatedDocs.map(({ doc, count }) => (
            <button
              key={doc}
              onClick={() => onSelectDoc(doc === selectedDoc ? null : doc)}
              className={`w-full text-left px-3 py-2 rounded text-sm ${
                selectedDoc === doc
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="truncate flex-1" title={doc}>
                  {doc}
                </span>
                <span className="ml-2 px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
                  {count}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RelatedDocumentsSidebar;

