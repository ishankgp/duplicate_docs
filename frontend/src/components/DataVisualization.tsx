import React, { useMemo } from 'react';
import { DocumentMetrics } from '../api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

interface DataVisualizationProps {
  documents: DocumentMetrics[];
}

const COLORS = {
  high: '#dc2626',
  medium: '#f97316',
  low: '#eab308',
  minimal: '#22c55e'
};

const DataVisualization: React.FC<DataVisualizationProps> = ({ documents }) => {
  const similarityDistribution = useMemo(() => {
    const ranges = [
      { name: 'High (70-100%)', min: 70, max: 100, count: 0, color: COLORS.high },
      { name: 'Medium (40-70%)', min: 40, max: 70, count: 0, color: COLORS.medium },
      { name: 'Low (20-40%)', min: 20, max: 40, count: 0, color: COLORS.low },
      { name: 'Minimal (0-20%)', min: 0, max: 20, count: 0, color: COLORS.minimal }
    ];

    documents.forEach(doc => {
      const score = doc.similarity_score;
      const range = ranges.find(r => score >= r.min && score < r.max);
      if (range) range.count++;
    });

    return ranges.filter(r => r.count > 0);
  }, [documents]);

  const topDocuments = useMemo(() => {
    return [...documents]
      .sort((a, b) => b.similarity_score - a.similarity_score)
      .slice(0, 10)
      .map(doc => ({
        name: doc.doc.length > 20 ? doc.doc.substring(0, 20) + '...' : doc.doc,
        fullName: doc.doc,
        similarity: doc.similarity_score,
        matched: doc.matched_sentences_pct,
        blocks: doc.in_block_sentences_pct
      }));
  }, [documents]);

  const matchTypeData = useMemo(() => {
    const totalMatched = documents.reduce((sum, doc) => sum + doc.matched_sentences_any, 0);
    const totalBlocks = documents.reduce((sum, doc) => sum + doc.in_block_sentences, 0);
    const totalSentences = documents.reduce((sum, doc) => sum + doc.total_sentences, 0);

    return [
      { name: 'Matched Sentences', value: totalMatched, color: '#3b82f6' },
      { name: 'Block Sentences', value: totalBlocks, color: '#f59e0b' },
      { name: 'Unique Sentences', value: Math.max(0, totalSentences - totalMatched), color: '#10b981' }
    ];
  }, [documents]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{payload[0].payload.fullName || label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 mt-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Similarity Distribution */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Similarity Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={similarityDistribution}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, count }) => `${name}: ${count}`}
              >
                {similarityDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Match Type Distribution */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Sentence Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={matchTypeData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, value }) => `${name}: ${value}`}
              >
                {matchTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Documents Bar Chart */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Top Documents by Similarity</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={topDocuments}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="similarity" name="Similarity Score" fill="#3b82f6" />
            <Bar dataKey="matched" name="Matched %" fill="#f59e0b" />
            <Bar dataKey="blocks" name="Block %" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <div className="text-2xl font-bold">
            {documents.length}
          </div>
          <div className="text-sm opacity-90">Total Documents</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-4 text-white">
          <div className="text-2xl font-bold">
            {Math.round(documents.reduce((sum, doc) => sum + doc.similarity_score, 0) / documents.length || 0)}%
          </div>
          <div className="text-sm opacity-90">Avg Similarity</div>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-4 text-white">
          <div className="text-2xl font-bold">
            {documents.reduce((sum, doc) => sum + doc.matched_sentences_any, 0)}
          </div>
          <div className="text-sm opacity-90">Total Duplicates</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
          <div className="text-2xl font-bold">
            {documents.reduce((sum, doc) => sum + doc.total_sentences, 0)}
          </div>
          <div className="text-sm opacity-90">Total Sentences</div>
        </div>
      </div>
    </div>
  );
};

export default DataVisualization;

