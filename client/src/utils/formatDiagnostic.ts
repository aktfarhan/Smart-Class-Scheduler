import { DATA_MAPS } from '../constants';
import { minutesToLabel } from './formatTime';
import type { CourseDiagnostic, DiagnosticReason } from '../types';

// Maps diagnostic failure reasons to human-readable descriptions
export const REASON_TEXT: Record<DiagnosticReason, string> = {
    ok: '',
    noTerm: 'No sections for this term',
    noDays: 'No sections on selected days',
    noTime: 'No sections in time range',
    conflict: 'No compatible section combination exists',
};

/**
 * Build a suggestion for a failing course diagnostic.
 *
 * @param diagnostic - Per-course diagnostic from the DFS scheduler.
 * @returns Suggestion string for fixable reasons, null otherwise.
 */
export function getSuggestion(diagnostic: CourseDiagnostic) {
    // Map pre-sorted days to full names
    if (diagnostic.reason === 'noDays' && diagnostic.availableDays.length > 0) {
        const dayNames = diagnostic.availableDays.map((day) => DATA_MAPS.FULL_DAY_MAP[day]);
        return `Available on ${dayNames.join(', ')}`;
    }
    // Convert earliest start time from minutes to a readable label
    if (diagnostic.reason === 'noTime' && diagnostic.earliestStart !== null) {
        return `Earliest section starts at ${minutesToLabel(diagnostic.earliestStart)}`;
    }
    return null;
}
