import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import DocumentViewer from './components/DocumentViewer';
import DocumentComparison from './components/DocumentComparison';
import AnalysisControl from './components/AnalysisControl';
import { getAnalysisStatus } from './api';
import config from './config';

function App() {
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'comparison' | 'viewer' | null>(null);
  const [hasResults, setHasResults] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    checkAnalysisStatus();
  }, []);

  const checkAnalysisStatus = async () => {
    try {
      console.log('Attempting to fetch from:', config.apiBaseUrl);
      const status = await getAnalysisStatus();
      console.log('API Response:', status);
      setHasResults(status.has_results);
      setApiError(null);
    } catch (err) {
      console.error('API Error:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setApiError(`Failed to connect to API at ${config.apiBaseUrl}. Error: ${errorMessage}`);
    }
  };

  const handleViewDetails = (docName: string) => {
    setSelectedDoc(docName);
    setViewMode('comparison');
  };

  const handleViewDocument = (docName: string) => {
    setSelectedDoc(docName);
    setViewMode('viewer');
  };

  const handleCloseModal = () => {
    setSelectedDoc(null);
    setViewMode(null);
  };

  const handleAnalysisComplete = () => {
    setHasResults(true);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                📄 Duplicate Document Detector
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                hasResults 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {hasResults ? '✓ Results Available' : '⚠ No Results'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* API Error Display */}
        {apiError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-bold text-red-900 mb-2">🔌 Connection Error</h3>
            <p className="text-sm text-red-800 mb-2">{apiError}</p>
            <div className="text-xs text-red-700 bg-red-100 p-2 rounded">
              <strong>Debug Info:</strong><br/>
              Expected API URL: {config.apiBaseUrl}<br/>
              Current Location: {window.location.href}<br/>
              Is Dev Container: {config.isDevContainer ? 'Yes' : 'No'}
            </div>
            <button 
              onClick={checkAnalysisStatus}
              className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            >
              Retry Connection
            </button>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Analysis Control */}
          <div className="lg:col-span-1">
            <AnalysisControl onAnalysisComplete={handleAnalysisComplete} />
            
            {/* Info Card */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-bold text-blue-900 mb-2">How to Use</h3>
              <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                <li>Place .docx files in the <code className="bg-blue-100 px-1 rounded">docs/</code> folder</li>
                <li>Click "Run New Analysis" to detect duplicates</li>
                <li>View results in the dashboard</li>
                <li>Click "View Duplicates" to see detailed matches</li>
                <li>Click "View Document" to see highlighted content</li>
              </ol>
            </div>

            {/* Legend Card */}
            <div className="mt-6 bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-bold text-gray-900 mb-3">Match Types</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="font-medium text-gray-700">Exact Match</span>
                  <span className="text-gray-500">- Identical sentences</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <span className="font-medium text-gray-700">Near-Duplicate</span>
                  <span className="text-gray-500">- SimHash similarity</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span className="font-medium text-gray-700">Semantic</span>
                  <span className="text-gray-500">- Similar meaning</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Dashboard */}
          <div className="lg:col-span-2">
            {hasResults ? (
              <Dashboard
                onViewDetails={handleViewDetails}
                onViewDocument={handleViewDocument}
                refreshTrigger={refreshTrigger}
              />
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                <div className="text-6xl mb-4">📊</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  No Analysis Results Yet
                </h2>
                <p className="text-gray-600 mb-6">
                  Run an analysis to detect duplicate content across your documents.
                </p>
                <p className="text-sm text-gray-500">
                  Make sure you have .docx files in the <code className="bg-gray-100 px-2 py-1 rounded">docs/</code> folder
                  before running the analysis.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      {selectedDoc && viewMode === 'viewer' && (
        <DocumentViewer
          docName={selectedDoc}
          onClose={handleCloseModal}
        />
      )}

      {selectedDoc && viewMode === 'comparison' && (
        <DocumentComparison
          docName={selectedDoc}
          onClose={handleCloseModal}
          onViewDocument={handleViewDocument}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            Duplicate Document Detection System • Built with React + FastAPI
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;

