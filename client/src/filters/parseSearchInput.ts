import type { SectionType, SearchFilters, Token, LookupData, Day } from '../types';
import { FILTER_CATEGORIES, DATA_MAPS, type AcademicTerm } from '../constants';
import { REGEX, DURATION_UNITS } from '../constants';

/**
 * Parses a raw search string into structured filters and metadata tokens.
 * It splits input by commas and identifies categories like course codes,
 * days, times, and terms.
 *
 * @param input - The raw search string from the user.
 * @param lookupData - Pre-loaded maps for validating departments and courses.
 * @returns An object containing the structured filters and a list of tokens for UI highlighting.
 */
export function parseSearchInput(
    input: string,
    lookupData: LookupData,
): { filters: SearchFilters; tokens: Token[] } {
    // Object to store recognized filters
    const filters: SearchFilters = {};

    // Array that holds text, type, and recognition status
    const tokens: Token[] = [];

    // Array that holds unknown input segments
    const unknownTextParts: string[] = [];

    // Check if input is empty; return no filters if it is
    const normalizedInput = input.trim();
    if (!normalizedInput) return { filters, tokens: [] };

    // Split the input by comma, trim spaces, and remove empty segments
    const segments = normalizedInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

    // Iterate over all segments to find filter types
    for (const segment of segments) {
        const lower = segment.toLowerCase();
        const upper = segment.toUpperCase();

        // Remove spaces for course code matching
        const cleanUpper = upper.replace(/\s/g, '');

        // --1-- Check if a segment matches a course code
        if (lookupData.courseMap.has(cleanUpper)) {
            filters.courseCode = cleanUpper;
            tokens.push({ text: segment, type: 'courseCode', isRecognized: true });
            continue;
        }

        // --2-- Check if a segment matches a department code or title
        const codeFromTitle = lookupData.departmentTitleToCode.get(lower);
        if (lookupData.departmentMap.has(upper) || codeFromTitle) {
            filters.departmentCode = codeFromTitle || upper;
            tokens.push({ text: segment, type: 'departmentCode', isRecognized: true });
            continue;
        }

        // --3-- Check if a segment matches a duration (90min, 2hr)
        const durationMatch = segment.match(REGEX.DURATION);
        if (durationMatch) {
            const [_, value, unit] = durationMatch;
            const multiplier = DURATION_UNITS.get(unit.toLowerCase()) ?? 1;
            filters.duration = parseInt(value, 10) * multiplier;
            tokens.push({ text: segment, type: 'duration', isRecognized: true });
            continue;
        }

        // --4-- Check if a segment matches a day (MWF, TuTh)
        if (REGEX.DAYS_STRICT.test(cleanUpper)) {
            const dayMatches = lower.match(REGEX.DAY_SEGMENTS);
            if (dayMatches) {
                const mappedDays = dayMatches.map((day) => DATA_MAPS.DAY_MAP[day as Day]);
                const allDays = [...(filters.days ?? []), ...mappedDays];
                filters.days = Array.from(new Set(allDays));
                tokens.push({ text: segment, type: 'day', isRecognized: true });
                continue;
            }
        }

        // --5-- Check if a segment matches a time of day
        const periodValue = DATA_MAPS.PERIOD_MAP[lower];
        if (periodValue) {
            filters.timeRange = periodValue;
            tokens.push({ text: segment, type: 'timeRange', isRecognized: true });
            continue;
        }

        // --6-- Check if a segment matches a specific time range
        const timeMatch = segment.match(REGEX.TIME_RANGE);
        if (timeMatch) {
            const [_, rawStart, rawEnd] = timeMatch;
            filters.timeRange = {
                start: rawStart.toLowerCase().replace(/\s+/g, ''),
                end: rawEnd.toLowerCase().replace(/\s+/g, ''),
            };
            tokens.push({ text: segment, type: 'timeRange', isRecognized: true });
            continue;
        }

        // --7-- Check if a segment matches an academic term
        const termMatch = segment.match(REGEX.TERM);
        if (termMatch) {
            const [_, s1, y1, y2, s2] = termMatch;
            const seasonRaw = s1 || s2;
            const year = y1 || y2;
            const season = seasonRaw.charAt(0).toUpperCase() + seasonRaw.slice(1).toLowerCase();
            const termKey = `${year} ${season}` as AcademicTerm;
            if (FILTER_CATEGORIES.TERMS.has(termKey)) {
                filters.term = termKey;
                tokens.push({ text: segment, type: 'term', isRecognized: true });
                continue;
            }
        }

        // --8-- Check if a segment matches a section type
        const sectionType = lower.charAt(0).toUpperCase() + lower.slice(1);
        if (FILTER_CATEGORIES.TYPES.has(sectionType)) {
            filters.sectionType = sectionType as SectionType;
            tokens.push({ text: segment, type: 'sectionType', isRecognized: true });
            continue;
        }

        // --9-- Handles unrecognized segments
        tokens.push({ text: segment, type: 'unknown', isRecognized: false });
        unknownTextParts.push(segment);
    }

    // Clean up accumulated text filter
    if (unknownTextParts.length > 0) {
        // Join and trim to ensure no leading/trailing whitespace
        filters.text = unknownTextParts.join(' ').trim();
    }

    return { filters, tokens };
}
