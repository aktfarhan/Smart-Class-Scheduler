import type { Day, ApiSectionWithRelations } from '../types';
import { formatTime, formatTimeToMinutes } from '../utils/formatTime';

/**
 * Checks if a section belongs to a specific term.
 *
 * @param section - The section data with relations.
 * @param term - The term to match.
 * @returns True if the term matches or no term is selected.
 */
export const sectionMatchesTerm = (section: ApiSectionWithRelations, term?: string) => {
    if (!term) return true;
    return section.term.toLowerCase() === term.toLowerCase();
};

/**
 * Searches for a partial match of an instructor's full name.
 *
 * @param section - The section data with relations.
 * @param name - The name to match.
 * @returns True if any instructor matches the name.
 */
export const sectionMatchesInstructor = (section: ApiSectionWithRelations, name?: string) => {
    if (!name) return true;
    const search = name.toLowerCase();
    return section.instructors.some((inst) =>
        `${inst.firstName} ${inst.lastName}`.toLowerCase().includes(search),
    );
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
    const sectionDays = new Set(section.meetings.map((m) => m.day));
    return filterDays.every((d) => sectionDays.has(d));
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
        // 1. Get the raw time range string (e.g., "5:30pm – 8:15pm")
        const timeRangeStr = formatTime(meeting);

        // 2. Convert that string to minutes
        const parsed = formatTimeToMinutes(timeRangeStr);
        if (!parsed) return false;

        // 3. Calculate actual duration
        const meetingDuration = parsed.endMins - parsed.startMins;
        return meetingDuration === duration;
    });
};
