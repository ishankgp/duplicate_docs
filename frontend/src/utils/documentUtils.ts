import { DocumentMetrics } from '../api';

/**
 * Sort documents by a given field and direction
 */
export function sortDocuments(
  documents: DocumentMetrics[],
  sortBy: string,
  direction: 'asc' | 'desc'
): DocumentMetrics[] {
  const sorted = [...documents];
  const multiplier = direction === 'asc' ? 1 : -1;

  sorted.sort((a, b) => {
    if (sortBy === 'doc') {
      return multiplier * a.doc.localeCompare(b.doc);
    }
    const aValue = a[sortBy as keyof DocumentMetrics] as number;
    const bValue = b[sortBy as keyof DocumentMetrics] as number;
    return multiplier * (aValue - bValue);
  });

  return sorted;
}

/**
 * Filter documents by match types
 */
export function filterByMatchTypes(
  documents: DocumentMetrics[],
  selectedTypes: string[]
): DocumentMetrics[] {
  if (selectedTypes.length === 0) return documents;

  return documents.filter((doc) => {
    const matchCounts = {
      exact: doc.matched_sentences_any,
      simhash: doc.in_block_sentences,
      embedding: 0, // Currently not tracked separately
    };
    return selectedTypes.some(
      (type) => matchCounts[type as keyof typeof matchCounts] > 0
    );
  });
}

/**
 * Filter documents by search term
 */
export function filterBySearch(
  documents: DocumentMetrics[],
  searchTerm: string
): DocumentMetrics[] {
  if (!searchTerm) return documents;

  const term = searchTerm.toLowerCase();
  return documents.filter((doc) =>
    doc.doc.toLowerCase().includes(term)
  );
}

/**
 * Calculate statistics from document list
 */
export interface DocumentStatistics {
  totalDocs: number;
  avgSimilarity: number;
  totalSentences: number;
  totalMatches: number;
  avgMatchedPct: number;
  highSimilarityDocs: number;
  moderateSimilarityDocs: number;
  lowSimilarityDocs: number;
}

export function calculateDocumentStats(
  documents: DocumentMetrics[]
): DocumentStatistics {
  if (documents.length === 0) {
    return {
      totalDocs: 0,
      avgSimilarity: 0,
      totalSentences: 0,
      totalMatches: 0,
      avgMatchedPct: 0,
      highSimilarityDocs: 0,
      moderateSimilarityDocs: 0,
      lowSimilarityDocs: 0,
    };
  }

  const totalSentences = documents.reduce(
    (sum, doc) => sum + doc.total_sentences,
    0
  );
  const totalMatches = documents.reduce(
    (sum, doc) => sum + doc.matched_sentences_any,
    0
  );
  const avgSimilarity =
    documents.reduce((sum, doc) => sum + doc.similarity_score, 0) /
    documents.length;
  const avgMatchedPct =
    documents.reduce((sum, doc) => sum + doc.matched_sentences_pct, 0) /
    documents.length;

  const highSimilarityDocs = documents.filter(
    (doc) => doc.similarity_score >= 50
  ).length;
  const moderateSimilarityDocs = documents.filter(
    (doc) => doc.similarity_score >= 25 && doc.similarity_score < 50
  ).length;
  const lowSimilarityDocs = documents.filter(
    (doc) => doc.similarity_score < 25
  ).length;

  return {
    totalDocs: documents.length,
    avgSimilarity,
    totalSentences,
    totalMatches,
    avgMatchedPct,
    highSimilarityDocs,
    moderateSimilarityDocs,
    lowSimilarityDocs,
  };
}

/**
 * Get sort option label by value
 */
export const sortOptions = [
  { value: 'similarity_score', label: 'Similarity Score' },
  { value: 'matched_sentences_pct', label: 'Match %' },
  { value: 'in_block_sentences_pct', label: 'Block %' },
  { value: 'total_sentences', label: 'Total Sentences' },
  { value: 'doc', label: 'Document Name' },
];

export function getSortLabel(value: string): string {
  return sortOptions.find((opt) => opt.value === value)?.label || value;
}

/**
 * Match type options
 */
export const matchTypeOptions = [
  { id: 'exact', label: 'Exact' },
  { id: 'simhash', label: 'Near-Duplicate' },
  { id: 'embedding', label: 'Semantic' },
];

/**
 * Preset filter options
 */
export const presetFilters = [
  { id: 'high', label: 'High Similarity (>50%)', minSimilarity: 50 },
  { id: 'moderate', label: 'Moderate Similarity (>25%)', minSimilarity: 25 },
  { id: 'low', label: 'Low Similarity (>10%)', minSimilarity: 10 },
];

