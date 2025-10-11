import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { DocumentMetrics } from '../api';

interface StatisticsOverviewProps {
  documents: DocumentMetrics[];
}

const COLORS = ['#dc2626', '#f97316', '#eab308', '#2563eb'];

const StatisticsOverview: React.FC<StatisticsOverviewProps> = ({ documents }) => {
  const aggregateData = documents.reduce(
    (acc, doc) => {
      acc.matched += doc.matched_sentences_any;
      acc.blocks += doc.in_block_sentences;
      return acc;
    },
    { matched: 0, blocks: 0 }
  );

  const totalMatches = aggregateData.matched || 1;

  const pieData = [
    { name: 'Exact Matches', value: documents.reduce((sum, doc) => sum + doc.matched_sentences_any, 0) },
    { name: 'Block Matches', value: aggregateData.blocks },
  ];

  const barData = documents.map((doc) => ({
    name: doc.doc,
    similarity: doc.similarity_score,
    matchedPct: doc.matched_sentences_pct,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Match Distribution</h3>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie dataKey="value" data={pieData} cx="50%" cy="50%" outerRadius={80} label>
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Comparison</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-10} textAnchor="end" height={70} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="similarity" fill="#2563eb" name="Similarity Score" radius={[6, 6, 0, 0]} />
            <Bar dataKey="matchedPct" fill="#10b981" name="Matched %" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatisticsOverview;
