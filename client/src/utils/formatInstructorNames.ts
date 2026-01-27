import type { ApiInstructor } from '../types';

/**
 * Takes an array of instructor objects and returns their full names
 * joined by a comma. Returns "TBA" or an empty string if none exist.
 */
export function getInstructorNames(instructors: ApiInstructor[]): string {
    if (!instructors || instructors.length === 0) return 'TBA';

    return instructors.map((inst) => `${inst.firstName} ${inst.lastName}`).join(', ');
}
