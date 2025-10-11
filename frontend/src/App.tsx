import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import DocumentViewer from './components/DocumentViewer';
import DocumentComparison from './components/DocumentComparison';
import AnalysisControl from './components/AnalysisControl';
import { ToastProvider, useToast } from './components/ToastContainer';
import { DarkModeProvider, DarkModeToggle } from './components/DarkModeToggle';
import KeyboardShortcuts from './components/KeyboardShortcuts';
import { getAnalysisStatus } from './api';

function AppContent() {
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'comparison' | 'viewer' | null>(null);
  const [hasResults, setHasResults] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [viewModeToggle, setViewModeToggle] = useState<'grid' | 'table'>('grid');
  const toast = useToast();
  const searchRef = useRef<HTMLInputElement>(null);
  const analysisControlRef = useRef<{ runAnalysis: () => void }>(null);

  useEffect(() => {
    checkAnalysisStatus();
  }, []);

  const checkAnalysisStatus = async () => {
    try {
      const status = await getAnalysisStatus();
      setHasResults(status.has_results);
    } catch (err) {
      console.error('Error checking analysis status:', err);
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
    toast.success('Analysis completed successfully!');
  };

  const handleRunAnalysis = () => {
    toast.info('Starting analysis...');
  };

  const handleToggleView = () => {
    setViewModeToggle(prev => prev === 'grid' ? 'table' : 'grid');
  };

  const handleFocusSearch = () => {
    searchRef.current?.focus();
    searchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                📄 Duplicate Document Detector
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                hasResults 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              }`}>
                {hasResults ? '✓ Results Available' : '⚠ No Results'}
              </div>
              <DarkModeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Analysis Control */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <AnalysisControl 
                onAnalysisComplete={handleAnalysisComplete}
                onAnalysisStart={handleRunAnalysis}
              />
              
              {/* Info Card */}
              <div className="mt-6 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4 animate-fade-in">
                <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">How to Use</h3>
                <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-2 list-decimal list-inside">
                  <li>Place .docx files in the <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">docs/</code> folder</li>
                  <li>Click "Run New Analysis" to detect duplicates</li>
                  <li>View results in the dashboard</li>
                  <li>Click "View Duplicates" to see detailed matches</li>
                  <li>Click "View Document" to see highlighted content</li>
                  <li>Press <kbd className="px-1 bg-blue-100 dark:bg-blue-800 rounded">?</kbd> for keyboard shortcuts</li>
                </ol>
              </div>

              {/* Legend Card */}
              <div className="mt-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 animate-fade-in">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3">Match Types</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Exact Match</span>
                    <span className="text-gray-500 dark:text-gray-400">- Identical sentences</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-500 rounded"></div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Near-Duplicate</span>
                    <span className="text-gray-500 dark:text-gray-400">- SimHash similarity</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Semantic</span>
                    <span className="text-gray-500 dark:text-gray-400">- Similar meaning</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Dashboard */}
          <div className="lg:col-span-3">
            {hasResults ? (
              <Dashboard
                onViewDetails={handleViewDetails}
                onViewDocument={handleViewDocument}
                refreshTrigger={refreshTrigger}
                searchRef={searchRef}
                viewModeToggle={viewModeToggle}
              />
            ) : (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-12 text-center animate-scale-in">
                <div className="text-6xl mb-4">📊</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  No Analysis Results Yet
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Run an analysis to detect duplicate content across your documents.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Make sure you have .docx files in the <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">docs/</code> folder
                  before running the analysis.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      {viewMode === 'viewer' && selectedDoc && (
        <DocumentViewer
          docName={selectedDoc}
          onClose={handleCloseModal}
        />
      )}

      {viewMode === 'comparison' && selectedDoc && (
        <DocumentComparison
          docName={selectedDoc}
          onClose={handleCloseModal}
          onViewDocument={handleViewDocument}
        />
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Duplicate Document Detection System • Built with React + FastAPI
          </p>
        </div>
      </footer>

      {/* Keyboard Shortcuts */}
      <KeyboardShortcuts
        onRunAnalysis={handleRunAnalysis}
        onToggleView={handleToggleView}
        onSearch={handleFocusSearch}
      />
    </div>
  );
}

function App() {
  return (
    <DarkModeProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </DarkModeProvider>
  );
}

export default App;

