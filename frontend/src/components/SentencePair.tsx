import React from 'react';
import { DuplicateMatch } from '../api';
import TooltipInfo from './TooltipInfo';

interface SentencePairProps {
  match: DuplicateMatch;
  currentDoc: string;
  onClick?: () => void;
}

const SentencePair: React.FC<SentencePairProps> = ({ match, currentDoc, onClick }) => {
  const category = match.category ?? 'cross-document';

  const getBorderColor = () => {
    if (category === 'within-document') {
      if (match.type === 'exact') return 'border-l-purple-500';
      if (match.type === 'simhash') return 'border-l-purple-400';
      return 'border-l-purple-300';
    }
    if (match.type === 'exact') return 'border-l-red-500';
    if (match.type === 'simhash') return 'border-l-orange-500';
    return 'border-l-yellow-500';
  };

  const getTypeBadge = () => {
    if (match.type === 'exact') return { label: 'Exact', className: 'bg-red-100 text-red-800' };
    if (match.type === 'simhash') return { label: 'Near-Dup', className: 'bg-orange-100 text-orange-800' };
    return { label: 'Semantic', className: 'bg-yellow-100 text-yellow-800' };
  };

  const typeBadge = getTypeBadge();

  return (
    <div 
      className={`border-l-4 ${getBorderColor()} bg-white p-4 rounded-r-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer animate-fade-in`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${typeBadge.className}`}>
            {typeBadge.label}
          </span>
          <TooltipInfo text="Match type indicates how the similarity was detected (exact copy, near duplicate, or semantic similarity)." />
          {category === 'within-document' && (
            <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
              Within Doc
            </span>
          )}
          <span className="text-xs text-gray-500">
            Sentence #{match.sent_id}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {category === 'within-document' 
            ? `→ Same document (#{match.other_sent_id})`
            : `→ ${match.other_doc} (#{match.other_sent_id})`
          }
        </span>
      </div>
      
      <div className="space-y-2">
        <div className="bg-gray-50 p-2 rounded text-sm">
          <div className="text-xs font-medium text-gray-500 mb-1">{currentDoc}:</div>
          <div className="text-gray-900">{match.text}</div>
        </div>
        
        <div className="bg-blue-50 p-2 rounded text-sm">
          <div className="text-xs font-medium text-gray-500 mb-1">{match.other_doc}:</div>
          <div className="text-gray-900">{match.other_text}</div>
        </div>
      </div>
      
      {match.hamming !== undefined && (
        <div className="mt-2 text-xs text-gray-500">
          Hamming distance: {match.hamming}
        </div>
      )}
      
      {match.cosine !== undefined && (
        <div className="mt-2 text-xs text-gray-500">
          Cosine similarity: {match.cosine.toFixed(4)}
        </div>
      )}
    </div>
  );
};

export default SentencePair;

