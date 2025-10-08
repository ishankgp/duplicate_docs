import React, { useState, useEffect, useRef } from 'react';
import { getDocumentContent, getHighlights, DocumentContent, Highlights } from '../api';
import LoadingSpinner from './LoadingSpinner';

interface DocumentViewerProps {
  docName: string;
  onClose: () => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ docName, onClose }) => {
  const [document, setDocument] = useState<DocumentContent | null>(null);
  const [highlights, setHighlights] = useState<Highlights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSentence, setSelectedSentence] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'exact' | 'simhash' | 'embedding'>('all');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadDocument();
  }, [docName]);

  const loadDocument = async () => {
    setLoading(true);
    setError(null);

    try {
      const [docData, highlightData] = await Promise.all([
        getDocumentContent(docName),
        getHighlights(docName)
      ]);

      setDocument(docData);
      setHighlights(highlightData);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (document && highlights && contentRef.current) {
      applyHighlights();
    }
  }, [document, highlights, filterType]);

  const applyHighlights = () => {
    if (!contentRef.current || !highlights) return;

    const sentences = contentRef.current.querySelectorAll('[data-sentence-id]');
    
    sentences.forEach((element) => {
      const sentId = parseInt(element.getAttribute('data-sentence-id') || '-1');
      const highlight = highlights.highlights[sentId];

      // Remove existing highlight classes
      element.classList.remove('highlight-exact', 'highlight-simhash', 'highlight-embedding');

      if (highlight) {
        // Apply filter
        if (filterType !== 'all' && highlight.type !== filterType) {
          return;
        }

        // Apply appropriate highlight class
        element.classList.add(`highlight-${highlight.type}`);

        // Add click handler
        element.addEventListener('click', () => handleSentenceClick(sentId));
      }
    });
  };

  const handleSentenceClick = (sentId: number) => {
    setSelectedSentence(sentId === selectedSentence ? null : sentId);
  };

  const scrollToSentence = (sentId: number) => {
    if (!contentRef.current) return;

    const element = contentRef.current.querySelector(`[data-sentence-id="${sentId}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setSelectedSentence(sentId);
      
      // Flash effect
      element.classList.add('ring-2', 'ring-blue-500');
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-blue-500');
      }, 1000);
    }
  };

  const getHighlightedSentences = () => {
    if (!highlights) return [];

    return Object.entries(highlights.highlights)
      .filter(([_, highlight]) => filterType === 'all' || highlight.type === filterType)
      .map(([sentId, highlight]) => ({
        sentId: parseInt(sentId),
        ...highlight
      }))
      .sort((a, b) => a.sentId - b.sentId);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
          <LoadingSpinner message="Loading document..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <h3 className="font-bold mb-2">Error loading document</h3>
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

  const highlightedSentences = getHighlightedSentences();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-7xl w-full h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{docName}</h2>
            <p className="text-sm text-gray-600 mt-1">
              {document?.total_sentences} sentences • {highlightedSentences.length} duplicates highlighted
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Filter Controls */}
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 text-sm rounded ${
                filterType === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              All ({Object.keys(highlights?.highlights || {}).length})
            </button>
            <button
              onClick={() => setFilterType('exact')}
              className={`px-3 py-1 text-sm rounded ${
                filterType === 'exact'
                  ? 'bg-red-600 text-white'
                  : 'bg-white border border-red-300 text-red-700 hover:bg-red-50'
              }`}
            >
              Exact
            </button>
            <button
              onClick={() => setFilterType('simhash')}
              className={`px-3 py-1 text-sm rounded ${
                filterType === 'simhash'
                  ? 'bg-orange-600 text-white'
                  : 'bg-white border border-orange-300 text-orange-700 hover:bg-orange-50'
              }`}
            >
              Near-Duplicate
            </button>
            <button
              onClick={() => setFilterType('embedding')}
              className={`px-3 py-1 text-sm rounded ${
                filterType === 'embedding'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-white border border-yellow-300 text-yellow-700 hover:bg-yellow-50'
              }`}
            >
              Semantic
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Document Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div
              ref={contentRef}
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: document?.html || '' }}
            />
          </div>

          {/* Sidebar with duplicate list */}
          <div className="w-80 border-l border-gray-200 overflow-y-auto bg-gray-50">
            <div className="p-4">
              <h3 className="font-bold text-gray-900 mb-3">
                Duplicate Sentences ({highlightedSentences.length})
              </h3>

              <div className="space-y-2">
                {highlightedSentences.map((item) => {
                  const typeColors = {
                    exact: 'border-red-500 bg-red-50',
                    simhash: 'border-orange-500 bg-orange-50',
                    embedding: 'border-yellow-500 bg-yellow-50'
                  };

                  return (
                    <div
                      key={item.sentId}
                      className={`p-3 border-l-4 ${typeColors[item.type]} rounded-r cursor-pointer hover:shadow-md transition-shadow ${
                        selectedSentence === item.sentId ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => scrollToSentence(item.sentId)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-700">
                          Sentence #{item.sentId}
                        </span>
                        <span className="text-xs font-medium text-gray-600 capitalize">
                          {item.type}
                        </span>
                      </div>

                      <div className="text-xs text-gray-600 mb-2">
                        Found in {item.docs.length} document{item.docs.length !== 1 ? 's' : ''}:
                      </div>

                      <div className="space-y-1">
                        {item.docs.slice(0, 3).map((doc, idx) => (
                          <div key={idx} className="text-xs text-gray-700 truncate" title={doc}>
                            • {doc}
                          </div>
                        ))}
                        {item.docs.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{item.docs.length - 3} more...
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {highlightedSentences.length === 0 && (
                <div className="text-center text-gray-500 text-sm py-8">
                  No duplicates found with current filter
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex items-center gap-6 text-xs">
          <span className="font-medium text-gray-700">Legend:</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 opacity-30 border-b-2 border-red-500"></div>
            <span className="text-gray-600">Exact Match</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 opacity-30 border-b-2 border-orange-500"></div>
            <span className="text-gray-600">Near-Duplicate</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 opacity-30 border-b-2 border-yellow-500"></div>
            <span className="text-gray-600">Semantic Match</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;

