import React, { useState, useEffect } from 'react';
import { getAnalysisStatus, runAnalysis, AnalysisStatus } from '../api';
import LoadingSpinner from './LoadingSpinner';

interface AnalysisControlProps {
  onAnalysisComplete?: () => void;
}

const AnalysisControl: React.FC<AnalysisControlProps> = ({ onAnalysisComplete }) => {
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
    
    // Poll for status if analysis is running
    const interval = setInterval(() => {
      if (status?.running) {
        fetchStatus();
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, [status?.running]);

  const handleRunAnalysis = async () => {
    setLoading(true);
    setError(null);
    
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
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Analysis Control</h2>
      
      {/* Status Display */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Status:</span>
            <span className={`ml-2 font-medium ${status.running ? 'text-blue-600' : status.has_results ? 'text-green-600' : 'text-gray-600'}`}>
              {status.running ? 'Running...' : status.has_results ? 'Complete' : 'No results'}
            </span>
          </div>
          
          {status.last_run && (
            <div>
              <span className="text-gray-500">Last Run:</span>
              <span className="ml-2 font-medium text-gray-900">
                {new Date(status.last_run).toLocaleString()}
              </span>
            </div>
          )}
          
          {status.summary && (
            <>
              <div>
                <span className="text-gray-500">Documents:</span>
                <span className="ml-2 font-medium text-gray-900">{status.summary.n_documents}</span>
              </div>
              <div>
                <span className="text-gray-500">Sentences:</span>
                <span className="ml-2 font-medium text-gray-900">{status.summary.n_sentences_kept}</span>
              </div>
              <div>
                <span className="text-gray-500">Exact Pairs:</span>
                <span className="ml-2 font-medium text-gray-900">{status.summary.exact_pairs}</span>
              </div>
              <div>
                <span className="text-gray-500">SimHash Pairs:</span>
                <span className="ml-2 font-medium text-gray-900">{status.summary.simhash_pairs_moderate}</span>
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
          <div className="mt-3 p-4 bg-gray-50 rounded-lg space-y-3">
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
            </label>
            
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Min Sentence Words</label>
                <input
                  type="number"
                  value={config.min_sentence_words}
                  onChange={(e) => setConfig({ ...config, min_sentence_words: parseInt(e.target.value) })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-600 mb-1">Hamming Strict</label>
                <input
                  type="number"
                  value={config.sim_hamming_strict}
                  onChange={(e) => setConfig({ ...config, sim_hamming_strict: parseInt(e.target.value) })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-600 mb-1">Hamming Moderate</label>
                <input
                  type="number"
                  value={config.sim_hamming_moderate}
                  onChange={(e) => setConfig({ ...config, sim_hamming_moderate: parseInt(e.target.value) })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
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
        className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
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

