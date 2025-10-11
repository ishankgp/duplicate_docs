import React, { useState } from 'react';
import { DocumentMetrics } from '../api';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

interface ExportMenuProps {
  documents: DocumentMetrics[];
}

const ExportMenu: React.FC<ExportMenuProps> = ({ documents }) => {
  const [isOpen, setIsOpen] = useState(false);

  const exportToCSV = () => {
    const headers = [
      'Document',
      'Total Sentences',
      'Matched Sentences',
      'Matched %',
      'Block Sentences',
      'Block %',
      'Similarity Score'
    ];

    const rows = documents.map(doc => [
      doc.doc,
      doc.total_sentences,
      doc.matched_sentences_any,
      doc.matched_sentences_pct.toFixed(2),
      doc.in_block_sentences,
      doc.in_block_sentences_pct.toFixed(2),
      doc.similarity_score.toFixed(2)
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    downloadFile(csv, 'duplicate-analysis.csv', 'text/csv');
    setIsOpen(false);
  };

  const exportToJSON = () => {
    const json = JSON.stringify(documents, null, 2);
    downloadFile(json, 'duplicate-analysis.json', 'application/json');
    setIsOpen(false);
  };

  const exportSummary = () => {
    const summary = {
      totalDocuments: documents.length,
      averageSimilarity: documents.reduce((sum, doc) => sum + doc.similarity_score, 0) / documents.length,
      totalSentences: documents.reduce((sum, doc) => sum + doc.total_sentences, 0),
      totalMatches: documents.reduce((sum, doc) => sum + doc.matched_sentences_any, 0),
      totalBlocks: documents.reduce((sum, doc) => sum + doc.in_block_sentences, 0),
      highSimilarityDocs: documents.filter(d => d.similarity_score >= 70).length,
      mediumSimilarityDocs: documents.filter(d => d.similarity_score >= 40 && d.similarity_score < 70).length,
      lowSimilarityDocs: documents.filter(d => d.similarity_score < 40).length,
      documents: documents.map(doc => ({
        name: doc.doc,
        similarity: doc.similarity_score,
        matches: doc.matched_sentences_any,
        blocks: doc.in_block_sentences
      }))
    };

    const json = JSON.stringify(summary, null, 2);
    downloadFile(json, 'duplicate-summary.json', 'application/json');
    setIsOpen(false);
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
      >
        <ArrowDownTrayIcon className="w-5 h-5" />
        Export
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
            <button
              onClick={exportToCSV}
              className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              <div className="font-medium text-gray-900">Export as CSV</div>
              <div className="text-xs text-gray-500">Spreadsheet compatible format</div>
            </button>
            <button
              onClick={exportToJSON}
              className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              <div className="font-medium text-gray-900">Export as JSON</div>
              <div className="text-xs text-gray-500">Complete data with all fields</div>
            </button>
            <button
              onClick={exportSummary}
              className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium text-gray-900">Export Summary</div>
              <div className="text-xs text-gray-500">Analysis overview report</div>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ExportMenu;

