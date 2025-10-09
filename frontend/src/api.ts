/**
 * API client for communicating with the FastAPI backend.
 */

import axios from 'axios';
import config from './config';

const api = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Types
export interface DocumentMetrics {
  doc: string;
  total_sentences: number;
  matched_sentences_any: number;
  matched_sentences_pct: number;
  in_block_sentences: number;
  in_block_sentences_pct: number;
  similarity_score: number;
}

export interface AnalysisStatus {
  has_results: boolean;
  running: boolean;
  last_run: string | null;
  last_result: any;
  summary: any;
}

export interface AnalysisRequest {
  use_embeddings?: boolean;
  min_sentence_words?: number;
  sim_hamming_strict?: number;
  sim_hamming_moderate?: number;
}

export interface DocumentContent {
  filename: string;
  html: string;
  sentences: Array<{
    id: number;
    text: string;
    normalized: string;
    word_count: number;
  }>;
  total_sentences: number;
}

export interface DuplicateMatch {
  other_doc: string;
  sent_id: number;
  other_sent_id: number;
  text: string;
  other_text: string;
  type: string;
  hamming?: number;
  cosine?: number;
}

export interface BlockMatch {
  other_doc: string;
  start: number;
  end: number;
  other_start: number;
  other_end: number;
  length: number;
}

export interface Duplicates {
  exact: DuplicateMatch[];
  simhash: DuplicateMatch[];
  embedding: DuplicateMatch[];
  blocks: BlockMatch[];
  duplicate_sentences: number[];
}

export interface HighlightDetail {
  doc: string;
  sent_id: number;
  text: string;
  hamming?: number;
  cosine?: number;
}

export interface Highlight {
  type: 'exact' | 'simhash' | 'embedding';
  priority: number;
  docs: string[];
  details: HighlightDetail[];
}

export interface Highlights {
  highlights: Record<number, Highlight>;
  total_highlighted: number;
}

// API functions

export const getAnalysisStatus = async (): Promise<AnalysisStatus> => {
  const response = await api.get('/api/analysis/status');
  return response.data;
};

export const runAnalysis = async (request: AnalysisRequest = {}): Promise<any> => {
  const response = await api.post('/api/analysis/run', request);
  return response.data;
};

export const getDocuments = async (
  sortBy: string = 'similarity_score',
  minSimilarity: number = 0,
  search?: string
): Promise<{ documents: DocumentMetrics[]; total: number }> => {
  const params: any = { sort_by: sortBy, min_similarity: minSimilarity };
  if (search) {
    params.search = search;
  }
  const response = await api.get('/api/documents', { params });
  return response.data;
};

export const getDocumentContent = async (docName: string): Promise<DocumentContent> => {
  const response = await api.get(`/api/document/${encodeURIComponent(docName)}`);
  return response.data;
};

export const getDuplicates = async (
  docName: string,
  matchType?: string
): Promise<Duplicates> => {
  const params = matchType ? { match_type: matchType } : {};
  const response = await api.get(`/api/duplicates/${encodeURIComponent(docName)}`, { params });
  return response.data;
};

export const getHighlights = async (docName: string): Promise<Highlights> => {
  const response = await api.get(`/api/highlights/${encodeURIComponent(docName)}`);
  return response.data;
};

export const getSimilarityMatrix = async (): Promise<Record<string, Record<string, number>>> => {
  const response = await api.get('/api/similarity-matrix');
  return response.data.matrix;
};

export const getBlockMatches = async (): Promise<any> => {
  const response = await api.get('/api/blocks');
  return response.data;
};

export default api;

