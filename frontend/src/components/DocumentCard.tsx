import React from 'react';
import { DocumentMetrics } from '../api';
import SimilarityBadge from './SimilarityBadge';

interface DocumentCardProps {
  doc: DocumentMetrics;
  onViewDetails: (docName: string) => void;
  onViewDocument: (docName: string) => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ doc, onViewDetails, onViewDocument }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900 truncate flex-1" title={doc.doc}>
          {doc.doc}
        </h3>
        <SimilarityBadge score={doc.similarity_score} />
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div>
          <span className="text-gray-500">Total Sentences:</span>
          <span className="ml-2 font-medium text-gray-900">{doc.total_sentences}</span>
        </div>
        <div>
          <span className="text-gray-500">Matched:</span>
          <span className="ml-2 font-medium text-gray-900">{doc.matched_sentences_any}</span>
          <span className="ml-1 text-xs text-gray-500">({doc.matched_sentences_pct.toFixed(1)}%)</span>
        </div>
        <div className="col-span-2">
          <span className="text-gray-500">In Blocks:</span>
          <span className="ml-2 font-medium text-gray-900">{doc.in_block_sentences}</span>
          <span className="ml-1 text-xs text-gray-500">({doc.in_block_sentences_pct.toFixed(1)}%)</span>
        </div>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={() => onViewDetails(doc.doc)}
          className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
        >
          View Duplicates
        </button>
        <button
          onClick={() => onViewDocument(doc.doc)}
          className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
        >
          View Document
        </button>
      </div>
    </div>
  );
};

export default DocumentCard;

