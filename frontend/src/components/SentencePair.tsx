import React from 'react';
import { DuplicateMatch } from '../api';
import SimilarityBadge from './SimilarityBadge';

interface SentencePairProps {
  match: DuplicateMatch;
  currentDoc: string;
  onClick?: () => void;
}

const SentencePair: React.FC<SentencePairProps> = ({ match, currentDoc, onClick }) => {
  const getBorderColor = () => {
    if (match.type === 'exact') return 'border-l-red-500';
    if (match.type === 'simhash') return 'border-l-orange-500';
    return 'border-l-yellow-500';
  };

  return (
    <div 
      className={`border-l-4 ${getBorderColor()} bg-white p-4 rounded-r-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <SimilarityBadge 
            score={100} 
            type={match.type as any} 
            showLabel={true}
          />
          <span className="text-xs text-gray-500">
            Sentence #{match.sent_id}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          → {match.other_doc} (#{match.other_sent_id})
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

