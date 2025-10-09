import React, { useState, useEffect } from 'react';
import { DocumentMetrics, DocumentRelationship, getDocumentRelationships } from '../api';
import SimilarityBadge from './SimilarityBadge';

interface DocumentCardProps {
  doc: DocumentMetrics;
  onViewDetails: (docName: string) => void;
  onViewDocument: (docName: string) => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ doc, onViewDetails, onViewDocument }) => {
  const [relationships, setRelationships] = useState<DocumentRelationship[]>([]);
  const [showAllRelationships, setShowAllRelationships] = useState(false);

  useEffect(() => {
    // Fetch relationships for this document
    const fetchRelationships = async () => {
      try {
        const data = await getDocumentRelationships(doc.doc);
        setRelationships(data.relationships);
      } catch (err) {
        console.error('Error fetching relationships:', err);
      }
    };
    
    fetchRelationships();
  }, [doc.doc]);

  const displayedRelationships = showAllRelationships ? relationships : relationships.slice(0, 3);

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

      {/* Related Documents Section */}
      {relationships.length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-700">Similar To:</h4>
            {relationships.length > 3 && (
              <button
                onClick={() => setShowAllRelationships(!showAllRelationships)}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                {showAllRelationships ? 'Show Less' : `+${relationships.length - 3} more`}
              </button>
            )}
          </div>
          <div className="space-y-2">
            {displayedRelationships.map((rel) => (
              <div key={rel.doc} className="text-xs bg-white p-2 rounded border border-gray-200">
                <div className="font-medium text-gray-900 truncate mb-1" title={rel.doc}>
                  {rel.doc}
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>{rel.total_matches} matches</span>
                  <span className="font-semibold text-blue-600">{rel.overlap_percentage}%</span>
                </div>
                {(rel.exact_matches > 0 || rel.simhash_matches > 0 || rel.embedding_matches > 0) && (
                  <div className="flex gap-2 mt-1 text-xs">
                    {rel.exact_matches > 0 && (
                      <span className="text-red-600">{rel.exact_matches} exact</span>
                    )}
                    {rel.simhash_matches > 0 && (
                      <span className="text-orange-600">{rel.simhash_matches} near</span>
                    )}
                    {rel.embedding_matches > 0 && (
                      <span className="text-yellow-600">{rel.embedding_matches} semantic</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
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

