import React, { useState, useEffect } from 'react';
import { getAnalysisStatus, runAnalysis, AnalysisStatus } from '../api';
import LoadingSpinner from './LoadingSpinner';
import TooltipInfo from './TooltipInfo';

interface AnalysisControlProps {
  onAnalysisComplete?: () => void;
  onAnalysisStart?: () => void;
}

const AnalysisControl: React.FC<AnalysisControlProps> = ({ onAnalysisComplete, onAnalysisStart }) => {
  const [status, setStatus] = useState<AnalysisStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useEmbeddings, setUseEmbeddings] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  
  // Configuration options
  const [config, setConfig] = useState({
    min_sentence_words: 8,
    sim_hamming_strict: 6,
    sim_hamming_moderate: 8,
  });

  const fetchStatus = async () => {
    try {
      const data = await getAnalysisStatus();
      setStatus(data);
      
      // If analysis was running and is now complete, trigger callback
      if (status?.running && !data.running && data.has_results) {
        onAnalysisComplete?.();
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchStatus();
    
    // Poll for status regularly
    const interval = setInterval(() => {
      fetchStatus();
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const handleRunAnalysis = async () => {
    setLoading(true);
    setError(null);
    onAnalysisStart?.();
    
    try {
      await runAnalysis({
        use_embeddings: useEmbeddings,
        ...config
      });
      
      // Start polling for status
      setTimeout(() => {
        fetchStatus();
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!status) {
    return <LoadingSpinner message="Loading analysis status..." size="small" />;
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 md:p-6 shadow-sm animate-fade-in">
      <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4">Analysis Control</h2>
      
      {/* Status Display */}
      <div className="mb-4 p-3 md:p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4 text-xs md:text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Status:</span>
            <span className={`ml-2 font-medium ${status.running ? 'text-blue-600 dark:text-blue-400' : status.has_results ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
              {status.running ? 'Running...' : status.has_results ? 'Complete' : 'No results'}
            </span>
          </div>
          
          {status.last_run && (
            <div className="flex items-center gap-1">
              <span className="text-gray-500">Last Run:</span>
              <TooltipInfo text="Timestamp of the most recent analysis run." />
              <span className="font-medium text-gray-900">
                {new Date(status.last_run).toLocaleString()}
              </span>
            </div>
          )}
          
          {status.summary && (
            <>
              <div className="flex items-center gap-1">
                <span className="text-gray-500">Documents:</span>
                <TooltipInfo text="Total number of documents processed in the last analysis." />
                <span className="font-medium text-gray-900">{status.summary.n_documents}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-500">Sentences:</span>
                <TooltipInfo text="Total sentences retained after preprocessing (minimum words filter)." />
                <span className="font-medium text-gray-900">{status.summary.n_sentences_kept}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-500">Exact Pairs:</span>
                <TooltipInfo text="Number of sentence pairs that are exact duplicates." />
                <span className="font-medium text-gray-900">{status.summary.exact_pairs}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-500">SimHash Pairs:</span>
                <TooltipInfo text="Number of sentence pairs detected as near duplicates via SimHash." />
                <span className="font-medium text-gray-900">{status.summary.simhash_pairs_moderate}</span>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Configuration */}
      <div className="mb-4">
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {showConfig ? '▼' : '▶'} Configuration Options
        </button>
        
        {showConfig && (
          <div className="mt-3 p-4 bg-gray-50 rounded-lg space-y-3 animate-scale-in">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={useEmbeddings}
                onChange={(e) => setUseEmbeddings(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Use Embeddings (slower, catches semantic matches)
              </span>
              <TooltipInfo text="Enable embeddings to detect semantic similarities beyond exact wording." />
            </label>
            
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1 flex items-center gap-1">
                  Min Sentence Words
                  <TooltipInfo text="Sentences shorter than this number of words are ignored." />
                </label>
                <input
                  type="number"
                  value={config.min_sentence_words}
                  onChange={(e) => setConfig({ ...config, min_sentence_words: parseInt(e.target.value) })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  disabled={loading || status.running}
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-600 mb-1 flex items-center gap-1">
                  Hamming Strict
                  <TooltipInfo text="Maximum Hamming distance for strict near-duplicate matches." />
                </label>
                <input
                  type="number"
                  value={config.sim_hamming_strict}
                  onChange={(e) => setConfig({ ...config, sim_hamming_strict: parseInt(e.target.value) })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  disabled={loading || status.running}
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-600 mb-1 flex items-center gap-1">
                  Hamming Moderate
                  <TooltipInfo text="Maximum Hamming distance for moderate similarity detection." />
                </label>
                <input
                  type="number"
                  value={config.sim_hamming_moderate}
                  onChange={(e) => setConfig({ ...config, sim_hamming_moderate: parseInt(e.target.value) })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  disabled={loading || status.running}
                />
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}
      
      {/* Run Button */}
      <button
        onClick={handleRunAnalysis}
        disabled={loading || status.running}
        className="w-full px-4 py-2 md:py-3 text-sm md:text-base text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium touch-manipulation"
        aria-label={loading || status.running ? 'Analysis in progress' : 'Start new document analysis'}
      >
        {loading || status.running ? 'Running Analysis...' : 'Run New Analysis'}
      </button>
      
      {status.running && (
        <div className="mt-4">
          <LoadingSpinner message="Analysis in progress..." size="small" />
        </div>
      )}
    </div>
  );
};

export default AnalysisControl;

