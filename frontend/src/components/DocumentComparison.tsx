import React, { useState, useEffect } from 'react';
import { getDuplicates, Duplicates, DuplicateMatch } from '../api';
import LoadingSpinner from './LoadingSpinner';
import SentencePair from './SentencePair';

interface DocumentComparisonProps {
  docName: string;
  onClose: () => void;
  onViewDocument: (docName: string) => void;
}

const DocumentComparison: React.FC<DocumentComparisonProps> = ({ 
  docName, 
  onClose,
  onViewDocument 
}) => {
  const [duplicates, setDuplicates] = useState<Duplicates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [matchTypeFilter, setMatchTypeFilter] = useState<'all' | 'exact' | 'simhash' | 'embedding'>('all');
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'sentence' | 'type'>('sentence');

  useEffect(() => {
    loadDuplicates();
  }, [docName]);

  const loadDuplicates = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getDuplicates(docName);
      setDuplicates(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  const getAllMatches = (): DuplicateMatch[] => {
    if (!duplicates) return [];

    const matches: DuplicateMatch[] = [
      ...duplicates.exact,
      ...duplicates.simhash,
      ...duplicates.embedding
    ];

    // Apply filters
    let filtered = matches;
    
    if (matchTypeFilter !== 'all') {
      filtered = filtered.filter(m => m.type === matchTypeFilter);
    }

    if (selectedDoc) {
      filtered = filtered.filter(m => m.other_doc === selectedDoc);
    }

    // Sort
    if (sortBy === 'sentence') {
      filtered.sort((a, b) => a.sent_id - b.sent_id);
    } else {
      const typeOrder = { exact: 0, simhash: 1, embedding: 2 };
      filtered.sort((a, b) => typeOrder[a.type as keyof typeof typeOrder] - typeOrder[b.type as keyof typeof typeOrder]);
    }

    return filtered;
  };

  const getRelatedDocuments = (): { doc: string; count: number }[] => {
    if (!duplicates) return [];

    const docCounts: Record<string, number> = {};

    [...duplicates.exact, ...duplicates.simhash, ...duplicates.embedding].forEach(match => {
      docCounts[match.other_doc] = (docCounts[match.other_doc] || 0) + 1;
    });

    return Object.entries(docCounts)
      .map(([doc, count]) => ({ doc, count }))
      .sort((a, b) => b.count - a.count);
  };

  const getStats = () => {
    if (!duplicates) return { exact: 0, simhash: 0, embedding: 0, total: 0, blocks: 0 };

    return {
      exact: duplicates.exact.length,
      simhash: duplicates.simhash.length,
      embedding: duplicates.embedding.length,
      total: duplicates.exact.length + duplicates.simhash.length + duplicates.embedding.length,
      blocks: duplicates.blocks.length
    };
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
          <LoadingSpinner message="Loading duplicates..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <h3 className="font-bold mb-2">Error loading duplicates</h3>
            <p>{error}</p>
          </div>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const matches = getAllMatches();
  const relatedDocs = getRelatedDocuments();
  const stats = getStats();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-7xl w-full h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Duplicate Analysis</h2>
            <p className="text-sm text-gray-600 mt-1">{docName}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onViewDocument(docName)}
              className="px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50"
            >
              View Document
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-xs text-gray-600">Total Matches</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{stats.exact}</div>
              <div className="text-xs text-gray-600">Exact</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{stats.simhash}</div>
              <div className="text-xs text-gray-600">Near-Duplicate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">{stats.embedding}</div>
              <div className="text-xs text-gray-600">Semantic</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{stats.blocks}</div>
              <div className="text-xs text-gray-600">Blocks</div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar - Related Documents */}
          <div className="w-64 border-r border-gray-200 overflow-y-auto bg-gray-50">
            <div className="p-4">
              <h3 className="font-bold text-gray-900 mb-3">
                Related Documents ({relatedDocs.length})
              </h3>

              <div className="space-y-2">
                <button
                  onClick={() => setSelectedDoc(null)}
                  className={`w-full text-left px-3 py-2 rounded text-sm ${
                    selectedDoc === null
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  All Documents
                </button>

                {relatedDocs.map(({ doc, count }) => (
                  <button
                    key={doc}
                    onClick={() => setSelectedDoc(doc === selectedDoc ? null : doc)}
                    className={`w-full text-left px-3 py-2 rounded text-sm ${
                      selectedDoc === doc
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate flex-1" title={doc}>{doc}</span>
                      <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full text-xs font-medium">
                        {count}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content - Sentence Pairs */}
          <div className="flex-1 overflow-y-auto">
            {/* Controls */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Filter:</span>
                  <button
                    onClick={() => setMatchTypeFilter('all')}
                    className={`px-3 py-1 text-sm rounded ${
                      matchTypeFilter === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setMatchTypeFilter('exact')}
                    className={`px-3 py-1 text-sm rounded ${
                      matchTypeFilter === 'exact'
                        ? 'bg-red-600 text-white'
                        : 'bg-white border border-red-300 text-red-700 hover:bg-red-50'
                    }`}
                  >
                    Exact
                  </button>
                  <button
                    onClick={() => setMatchTypeFilter('simhash')}
                    className={`px-3 py-1 text-sm rounded ${
                      matchTypeFilter === 'simhash'
                        ? 'bg-orange-600 text-white'
                        : 'bg-white border border-orange-300 text-orange-700 hover:bg-orange-50'
                    }`}
                  >
                    Near-Dup
                  </button>
                  <button
                    onClick={() => setMatchTypeFilter('embedding')}
                    className={`px-3 py-1 text-sm rounded ${
                      matchTypeFilter === 'embedding'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-white border border-yellow-300 text-yellow-700 hover:bg-yellow-50'
                    }`}
                  >
                    Semantic
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="sentence">By Sentence ID</option>
                    <option value="type">By Match Type</option>
                  </select>
                </div>
              </div>

              <div className="mt-2 text-sm text-gray-600">
                Showing {matches.length} match{matches.length !== 1 ? 'es' : ''}
              </div>
            </div>

            {/* Sentence Pairs List */}
            <div className="p-4 space-y-3">
              {matches.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No matches found with current filters
                </div>
              ) : (
                matches.map((match, idx) => (
                  <SentencePair
                    key={`${match.type}-${match.sent_id}-${match.other_sent_id}-${idx}`}
                    match={match}
                    currentDoc={docName}
                    onClick={() => {
                      // Could implement scrolling to this sentence in the document viewer
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentComparison;

