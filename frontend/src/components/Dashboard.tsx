import React, { useState, useEffect } from 'react';
import { DocumentMetrics, getDocuments } from '../api';
import DocumentCard from './DocumentCard';
import LoadingSpinner from './LoadingSpinner';
import SimilarityBadge from './SimilarityBadge';

interface DashboardProps {
  onViewDetails: (docName: string) => void;
  onViewDocument: (docName: string) => void;
  refreshTrigger?: number;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  onViewDetails, 
  onViewDocument,
  refreshTrigger = 0
}) => {
  const [documents, setDocuments] = useState<DocumentMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('similarity_score');
  const [minSimilarity, setMinSimilarity] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getDocuments(sortBy, minSimilarity, searchTerm || undefined);
      setDocuments(data.documents);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [sortBy, minSimilarity, searchTerm, refreshTrigger]);

  if (loading) {
    return <LoadingSpinner message="Loading documents..." />;
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <h3 className="font-bold mb-2">Error loading documents</h3>
          <p>{error}</p>
          <button 
            onClick={fetchDocuments}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'Try adjusting your search or filters.' : 'No analysis results available. Run an analysis first.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Document Dashboard</h1>
        <p className="text-gray-600">
          Found {documents.length} document{documents.length !== 1 ? 's' : ''} with duplicate content
        </p>
      </div>

      {/* Controls */}
      <div className="mb-6 bg-white border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Documents
            </label>
            <input
              type="text"
              placeholder="Search by filename..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="similarity_score">Similarity Score</option>
              <option value="matched_sentences_pct">Match %</option>
              <option value="in_block_sentences_pct">Block %</option>
              <option value="total_sentences">Total Sentences</option>
              <option value="doc">Document Name</option>
            </select>
          </div>

          {/* Min Similarity Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Similarity
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="5"
              value={minSimilarity}
              onChange={(e) => setMinSimilarity(parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="mt-4 flex justify-end">
          <div className="inline-flex rounded-lg border border-gray-300">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Grid View
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Table View
            </button>
          </div>
        </div>
      </div>

      {/* Documents Display */}
      {viewMode === 'grid' ? (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
            {documents.map((doc) => (
            <DocumentCard
              key={doc.doc}
              doc={doc}
              onViewDetails={onViewDetails}
              onViewDocument={onViewDocument}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Similarity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Sentences
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Matched
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  In Blocks
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {documents.map((doc) => (
                <tr key={doc.doc} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {doc.doc}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <SimilarityBadge score={doc.similarity_score} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {doc.total_sentences}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {doc.matched_sentences_any} ({doc.matched_sentences_pct.toFixed(1)}%)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {doc.in_block_sentences} ({doc.in_block_sentences_pct.toFixed(1)}%)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onViewDetails(doc.doc)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => onViewDocument(doc.doc)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

