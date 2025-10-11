import React from 'react';

interface SimilarityBadgeProps {
  score: number;
}

const SimilarityBadge: React.FC<SimilarityBadgeProps> = ({ score }) => {
  const getColor = (s: number) => {
    if (s >= 70) return '#dc2626'; // red-600
    if (s >= 40) return '#f97316'; // orange-500
    if (s >= 20) return '#eab308'; // yellow-500
    return '#22c55e'; // green-500
  };

  const color = getColor(score);
  const circumference = 2 * Math.PI * 18; // 2 * pi * radius
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-12 h-12">
      <svg className="w-full h-full" viewBox="0 0 40 40">
        <circle
          className="text-gray-200"
          strokeWidth="4"
          stroke="currentColor"
          fill="transparent"
          r="18"
          cx="20"
          cy="20"
        />
        <circle
          className="transition-all duration-500 ease-in-out"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke={color}
          fill="transparent"
          r="18"
          cx="20"
          cy="20"
          transform="rotate(-90 20 20)"
        />
      </svg>
      <span className="absolute text-sm font-bold" style={{ color }}>
        {score.toFixed(1)}%
      </span>
    </div>
  );
};

export default SimilarityBadge;

