import React, { useState, useEffect } from 'react';
import { DocumentMetrics, DocumentRelationship, getDocumentRelationships } from '../api';
import SimilarityBadge from './SimilarityBadge';
import { BeakerIcon, DocumentDuplicateIcon, LightBulbIcon, Bars3BottomLeftIcon } from '@heroicons/react/24/outline';
import TooltipInfo from './TooltipInfo';

interface DocumentCardProps {
  doc: DocumentMetrics;
  onViewDetails: (docName: string) => void;
  onViewDocument: (docName: string) => void;
}

const getSimilarityColor = (score: number) => {
  if (score >= 70) return '#dc2626';
  if (score >= 40) return '#f97316';
  if (score >= 20) return '#eab308';
  return '#22c55e';
};

const DocumentCard: React.FC<DocumentCardProps> = ({ doc, onViewDetails, onViewDocument }) => {
  const [relationships, setRelationships] = useState<DocumentRelationship[]>([]);
  const [showAllRelationships, setShowAllRelationships] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
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
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 md:p-4 hover:shadow-lg transition-shadow animate-fade-in touch-manipulation">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white truncate" title={doc.doc}>
            {doc.doc}
          </h3>
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Bars3BottomLeftIcon className="w-3.5 h-3.5" />
              {doc.total_sentences} sentences
            </span>
            <span>•</span>
            <span>{doc.matched_sentences_any} matched</span>
          </div>
        </div>
        <SimilarityBadge score={doc.similarity_score} />
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="font-medium text-gray-700 flex items-center gap-1">
            Similarity Score
            <TooltipInfo text="Overall similarity score computed from matched sentences and block duplicates." />
          </span>
          <span className="font-semibold text-gray-900">{doc.similarity_score.toFixed(1)}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(doc.similarity_score, 100)}%`, backgroundColor: getSimilarityColor(doc.similarity_score) }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
        <div>
          <span className="text-gray-500 flex items-center gap-1">
            Matched Sentences
            <TooltipInfo text="Total sentences that have at least one duplicate across documents." />
          </span>
          <span className="ml-2 font-medium text-gray-900">{doc.matched_sentences_any}</span>
          <span className="ml-1 text-xs text-gray-500">({doc.matched_sentences_pct.toFixed(1)}%)</span>
        </div>
        <div>
          <span className="text-gray-500 flex items-center gap-1">
            In Blocks
            <TooltipInfo text="Sentences that participate in longer duplicate segments (block matches)." />
          </span>
          <span className="ml-2 font-medium text-gray-900">{doc.in_block_sentences}</span>
          <span className="ml-1 text-xs text-gray-500">({doc.in_block_sentences_pct.toFixed(1)}%)</span>
        </div>
      </div>

      <button
        onClick={() => setShowDetails((prev) => !prev)}
        className="mt-4 inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-800"
      >
        {showDetails ? 'Hide metrics' : 'Show metrics'}
      </button>

      {showDetails && (
        <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 space-y-2 animate-fade-in">
          <div className="flex justify-between">
            <span>Average match %:</span>
            <span className="font-medium text-gray-900">{doc.matched_sentences_pct.toFixed(2)}%</span>
          </div>
          <div className="flex justify-between">
            <span>Average block %:</span>
            <span className="font-medium text-gray-900">{doc.in_block_sentences_pct.toFixed(2)}%</span>
          </div>
          <div className="flex justify-between">
            <span>Total sentences:</span>
            <span className="font-medium text-gray-900">{doc.total_sentences}</span>
          </div>
        </div>
      )}

      {relationships.length > 0 && (
        <div className="mt-4 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
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
                  <div className="flex gap-3 mt-1 text-xs">
                    {rel.exact_matches > 0 && (
                      <span className="text-red-600 flex items-center gap-1"><DocumentDuplicateIcon className="w-3.5 h-3.5" />{rel.exact_matches} exact</span>
                    )}
                    {rel.simhash_matches > 0 && (
                      <span className="text-orange-600 flex items-center gap-1"><BeakerIcon className="w-3.5 h-3.5" />{rel.simhash_matches} near</span>
                    )}
                    {rel.embedding_matches > 0 && (
                      <span className="text-yellow-600 flex items-center gap-1"><LightBulbIcon className="w-3.5 h-3.5" />{rel.embedding_matches} semantic</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={() => onViewDetails(doc.doc)}
          className="flex-1 px-3 py-2 text-xs md:text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors touch-manipulation"
          aria-label={`View duplicate details for ${doc.doc}`}
        >
          View Duplicates
        </button>
        <button
          onClick={() => onViewDocument(doc.doc)}
          className="flex-1 px-3 py-2 text-xs md:text-sm font-medium text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-700 border border-blue-600 dark:border-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors touch-manipulation"
          aria-label={`View full document for ${doc.doc}`}
        >
          View Document
        </button>
      </div>
    </div>
  );
};

export default DocumentCard;

