import React from 'react';

interface SimilarityBadgeProps {
  score: number;
  type?: 'exact' | 'simhash' | 'embedding' | 'overall';
  showLabel?: boolean;
}

const SimilarityBadge: React.FC<SimilarityBadgeProps> = ({ 
  score, 
  type = 'overall',
  showLabel = true 
}) => {
  const getColorClass = () => {
    if (type === 'exact') return 'bg-red-100 text-red-800 border-red-300';
    if (type === 'simhash') return 'bg-orange-100 text-orange-800 border-orange-300';
    if (type === 'embedding') return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    
    // Overall score color gradient
    if (score >= 70) return 'bg-red-100 text-red-800 border-red-300';
    if (score >= 40) return 'bg-orange-100 text-orange-800 border-orange-300';
    if (score >= 20) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-green-100 text-green-800 border-green-300';
  };

  const getLabel = () => {
    if (!showLabel) return '';
    
    if (type === 'exact') return 'Exact';
    if (type === 'simhash') return 'Near-Dup';
    if (type === 'embedding') return 'Semantic';
    
    if (score >= 70) return 'Very High';
    if (score >= 40) return 'High';
    if (score >= 20) return 'Moderate';
    return 'Low';
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getColorClass()}`}>
      {showLabel && <span className="mr-1">{getLabel()}</span>}
      <span className="font-bold">{score.toFixed(1)}%</span>
    </span>
  );
};

export default SimilarityBadge;

