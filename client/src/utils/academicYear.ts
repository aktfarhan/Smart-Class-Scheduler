import type { AcademicTerm } from '../types';

// Four academic seasons in calendar order within an AY
export type Season = 'Fall' | 'Winter' | 'Spring' | 'Summer';
export const SEASONS: readonly Season[] = ['Fall', 'Winter', 'Spring', 'Summer'];

// Term detector regex
const WHOLE_TERM =
    /^(fall|winter|spring|summer)\s*(\d{4})$|^(\d{4})\s*(fall|winter|spring|summer)$/i;

/**
 * Pick the current academic year based on today's date.
 *
 * @returns AY start year.
 */
export function getCurrentAYStart(): number {
    const today = new Date();
    return today.getMonth() >= 7 ? today.getFullYear() : today.getFullYear() - 1;
}

/**
 * Build the four term strings that are in a given academic year.
 *
 * @param ayStart - AY start year (e.g., 2025 for AY 25-26).
 * @returns Array of four term strings in calendar order.
 */
export function getTermsForAY(ayStart: number): string[] {
    return SEASONS.map((season) => {
        const year = season === 'Fall' ? ayStart : ayStart + 1;
        return `${year} ${season}`;
    });
}

/**
 * Extract the academic year start from a term string.
 *
 * @param term - Term string like "2026 Spring".
 * @returns AY start year.
 */
export function getAYForTerm(term: AcademicTerm): number {
    const [year, season] = term.split(' ');
    return season === 'Fall' ? Number(year) : Number(year) - 1;
}

/**
 * Format an AY start year into a display label.
 *
 * @param ayStart - AY start year (e.g., 2025).
 * @returns Short label like "25-26".
 */
export function formatAYLabel(ayStart: number): string {
    const start = String(ayStart).slice(-2);
    const end = String(ayStart + 1).slice(-2);
    return `${start}-${end}`;
}

/**
 * Pick a default season based on today's calendar month.
 *
 * @returns Season matching the current academic term.
 */
export function pickDefaultSeason(): Season {
    const month = new Date().getMonth();
    if (month < 2) return 'Winter';
    if (month < 5) return 'Spring';
    if (month < 7) return 'Summer';
    return 'Fall';
}

/**
 * Rewrite term expressions inside a search query to match a new AY.
 *
 * @param searchQuery - Raw search string from the user.
 * @param newAY - Target AY start year.
 * @returns Rewritten search query.
 */
export function rewriteTermTokens(searchQuery: string, newAY: number): string {
    if (!searchQuery) return searchQuery;

    // 1. Split on commas, trim, drop empty tokens
    const tokens = searchQuery
        .split(',')
        .map((token) => token.trim())
        .filter(Boolean);

    // 2. Swap only the year on each term token
    const rewritten = tokens.map((token) => {
        const match = token.match(WHOLE_TERM);
        if (!match) return token;

        // Fall uses the same AY, others use the following year
        const rawSeason = match[1] || match[4];
        const newYear = rawSeason.toLowerCase() === 'fall' ? newAY : newAY + 1;
        return token.replace(/\d{4}/, String(newYear));
    });

    // 3. Dedupe identical tokens
    return [...new Set(rewritten)].join(', ');
}
