// Type of filtering
export type MatchMode = 'strict' | 'partial';

/**
 * Returns the Prisma filter key based on match mode.
 * For 'strict', use 'equals'.
 * For 'partial' or default, use 'contains'.
 */
export function getFilterKey(mode: MatchMode) {
    return mode === 'strict' ? 'equals' : 'contains';
}
