import React from 'react';
import { MatchStatistics } from '../utils/matchUtils';

interface ComparisonStatsProps {
  stats: MatchStatistics;
}

const ComparisonStats: React.FC<ComparisonStatsProps> = ({ stats }) => {
  return (
    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="grid grid-cols-7 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.total}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Total Matches</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {stats.exact}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Exact</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {stats.simhash}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Near-Duplicate</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {stats.embedding}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Semantic</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.blocks}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Blocks</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.crossDoc}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Cross-Doc</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {stats.withinDoc}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Within-Doc</div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonStats;

