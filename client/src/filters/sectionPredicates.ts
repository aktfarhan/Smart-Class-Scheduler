import { getAYForTerm } from '../utils/academicYear';
import { meetingToMinutes, toMinutes } from '../utils/formatTime';
import type { AcademicTerm, Day, ApiSectionWithRelations, SectionType } from '../types';

/**
 * Checks if a section matches the active term/AY context.
 *
 * @param section - The section data with relations.
 * @param term - Specific term to match.
 * @param academicYear - AY start year to match when no specific term is set.
 * @returns True if the section belongs to the active term or AY.
 */
export const sectionMatchesTermContext = (
    section: ApiSectionWithRelations,
    term?: AcademicTerm,
    academicYear?: number,
) => {
    // Specific term wins so search overrides (e.g., "fall 2025") work while dropdown stays elsewhere
    if (term) return section.term.toLowerCase() === term.toLowerCase();
    if (academicYear !== undefined) return getAYForTerm(section.term) === academicYear;
    return true;
};

/**
 * Filters a section based on its type.
 *
 * @param section - The section data with relations.
 * @param type - The selected SectionType.
 * @returns True if the section matches the requested type.
 */
export const sectionMatchesType = (section: ApiSectionWithRelations, type?: SectionType) => {
    if (!type) return true;

    // Trim handles trailing spaces in section numbers
    const sectionNum = section.sectionNumber.trim().toUpperCase();
    const isDiscussion = sectionNum.endsWith('D');

    // Ensure types are compared consistently (Upper to Upper)
    const activeFilter = type.toUpperCase();

    if (activeFilter === 'DISCUSSION') {
        return isDiscussion;
    }

    if (activeFilter === 'LECTURE') {
        return !isDiscussion;
    }

    return true;
};

/**
 * Searches for a partial match of an instructor's full name.
 *
 * @param section - The section data with relations.
 * @param name - The name or partial name to match.
 * @returns True if any instructor in the section matches the search terms.
 */
export const sectionMatchesInstructor = (section: ApiSectionWithRelations, name?: string) => {
    if (!name) return true;

    // Split search into individual words for better search
    const searchTerms = name.split(/\s+/);

    return section.instructors.some((instructor) => {
        // Build full instructor name
        const fullName = `${instructor.firstName} ${instructor.lastName}`.toLowerCase();

        // Every typed word must appear somewhere in the instructor's full name
        return searchTerms.every((term) => fullName.includes(term));
    });
};

/**
 * Filters a section by their meeting days.
 *
 * @param section - The section data with relations.
 * @param filterDays - An array of days selected.
 * @returns - True if the class covers every day selected.
 */
export const sectionMatchesDays = (section: ApiSectionWithRelations, filterDays?: Day[]) => {
    if (!filterDays?.length) return true;
    const sectionDays = new Set(section.meetings.map((meeting) => meeting.day));
    return filterDays.every((day) => sectionDays.has(day));
};

/**
 * Filters a section based on how class meeting duration.
 *
 * @param section - The section data with relations.
 * @param duration - The duration of a class in minutes.
 * @returns - True if any of the section's meetings match this exact length.
 */
export const sectionMatchesDuration = (section: ApiSectionWithRelations, duration?: number) => {
    if (!duration) return true;

    return section.meetings.some((meeting) => {
        // Parse meeting times directly to minutes and compare duration
        const { startMins, endMins } = meetingToMinutes(meeting);
        return endMins - startMins === duration;
    });
};

/**
 * Filters a section based on a strict time window.
 * Ensures the class meeting starts and ends entirely within the selected range.
 *
 * @param section - The section data with relations.
 * @param range - The start and end time strings.
 * @returns True if any of the section's meetings fit within the time range.
 */
export const sectionMatchesTimeRange = (
    section: ApiSectionWithRelations,
    range?: { start: string; end: string },
) => {
    if (!range) return true;

    const startLimit = toMinutes(range.start);
    const endLimit = toMinutes(range.end);

    return section.meetings.some((meeting) => {
        // Meeting must be fully inside the range
        const { startMins, endMins } = meetingToMinutes(meeting);
        return startMins >= startLimit && endMins <= endLimit;
    });
};
