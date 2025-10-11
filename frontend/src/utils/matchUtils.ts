import { DuplicateMatch, Duplicates } from '../api';

/**
 * Get similarity score from a match
 */
export function getMatchScore(match: DuplicateMatch): number {
  if (typeof match.cosine === 'number') {
    return match.cosine;
  }
  if (typeof match.hamming === 'number') {
    const maxBits = 64;
    return 1 - match.hamming / maxBits;
  }
  return 0;
}

/**
 * Normalize Hamming distance to a 0-1 similarity score
 */
export function normalizeHammingScore(hamming: number, maxBits: number = 64): number {
  return 1 - hamming / maxBits;
}

/**
 * Filter matches by type
 */
export function filterMatchesByType(
  matches: DuplicateMatch[],
  type: 'all' | 'exact' | 'simhash' | 'embedding'
): DuplicateMatch[] {
  if (type === 'all') return matches;
  return matches.filter((m) => m.type === type);
}

/**
 * Filter matches by category
 */
export function filterMatchesByCategory(
  matches: DuplicateMatch[],
  category: 'all' | 'cross-document' | 'within-document'
): DuplicateMatch[] {
  if (category === 'all') return matches;
  return matches.filter((m) => (m.category ?? 'cross-document') === category);
}

/**
 * Filter matches by document
 */
export function filterMatchesByDocument(
  matches: DuplicateMatch[],
  docName: string | null
): DuplicateMatch[] {
  if (!docName) return matches;
  return matches.filter((m) => m.other_doc === docName);
}

/**
 * Sort matches by different criteria
 */
export type MatchSortBy = 'sentence' | 'type' | 'score';

export function sortMatches(
  matches: DuplicateMatch[],
  sortBy: MatchSortBy,
  direction: 'asc' | 'desc'
): DuplicateMatch[] {
  const sorted = [...matches];
  const multiplier = direction === 'asc' ? 1 : -1;

  sorted.sort((a, b) => {
    if (sortBy === 'sentence') {
      return multiplier * (a.sent_id - b.sent_id);
    }
    if (sortBy === 'score') {
      return multiplier * (getMatchScore(a) - getMatchScore(b));
    }
    // Sort by type
    const typeOrder: Record<string, number> = { exact: 0, simhash: 1, embedding: 2 };
    const aOrder = typeOrder[a.type] ?? 99;
    const bOrder = typeOrder[b.type] ?? 99;
    return multiplier * (aOrder - bOrder);
  });

  return sorted;
}

/**
 * Get all matches from duplicates object
 */
export function getAllMatches(duplicates: Duplicates | null): DuplicateMatch[] {
  if (!duplicates) return [];
  return [...duplicates.exact, ...duplicates.simhash, ...duplicates.embedding];
}

/**
 * Calculate match statistics
 */
export interface MatchStatistics {
  exact: number;
  simhash: number;
  embedding: number;
  total: number;
  blocks: number;
  crossDoc: number;
  withinDoc: number;
}

export function calculateMatchStats(duplicates: Duplicates | null): MatchStatistics {
  if (!duplicates) {
    return { exact: 0, simhash: 0, embedding: 0, total: 0, blocks: 0, crossDoc: 0, withinDoc: 0 };
  }

  const allMatches = getAllMatches(duplicates);
  const crossDoc = allMatches.filter(
    (m) => (m.category ?? 'cross-document') === 'cross-document'
  ).length;
  const withinDoc = allMatches.filter(
    (m) => (m.category ?? 'cross-document') === 'within-document'
  ).length;

  return {
    exact: duplicates.exact.length,
    simhash: duplicates.simhash.length,
    embedding: duplicates.embedding.length,
    total: allMatches.length,
    blocks: duplicates.blocks.length,
    crossDoc,
    withinDoc,
  };
}

/**
 * Get related documents with match counts
 */
export interface RelatedDocument {
  doc: string;
  count: number;
}

export function getRelatedDocuments(duplicates: Duplicates | null): RelatedDocument[] {
  if (!duplicates) return [];

  const docCounts: Record<string, number> = {};
  const allMatches = getAllMatches(duplicates);

  allMatches.forEach((match) => {
    docCounts[match.other_doc] = (docCounts[match.other_doc] || 0) + 1;
  });

  return Object.entries(docCounts)
    .map(([doc, count]) => ({ doc, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Paginate an array
 */
export interface PaginationResult<T> {
  items: T[];
  totalPages: number;
  startIndex: number;
  endIndex: number;
  totalItems: number;
}

export function paginate<T>(
  items: T[],
  currentPage: number,
  itemsPerPage: number
): PaginationResult<T> {
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = items.slice(startIndex, endIndex);

  return {
    items: paginatedItems,
    totalPages,
    startIndex,
    endIndex,
    totalItems,
  };
}

