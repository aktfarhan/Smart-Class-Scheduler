import type { ApiCourseWithDepartment } from '../types';

/**
 * Checks if a course belongs to a specific department.
 *
 * @param course - The course record to evaluate.
 * @param deptCode - The target department code (e.g., 'CS').
 * @returns True if the department matches or if no filter is set.
 */
export const courseMatchesDept = (course: ApiCourseWithDepartment, deptCode?: string) =>
    !deptCode || course.department.code === deptCode;

/**
 * Matches a course by its combined code (e.g., "CS101").
 * This logic squashes spaces to ensure "CS 101" and "CS101" both match.
 *
 * @param course - The course record to evaluate.
 * @param courseCode - The normalized code from the search parser.
 * @returns True if the squashed codes match exactly.
 */
export const courseMatchesCode = (course: ApiCourseWithDepartment, courseCode?: string) => {
    if (!courseCode) return true;

    // We combine and clean the course's own data to match the parser's strict format
    const combined = `${course.department.code}${course.code}`.replace(/\s/g, '').toUpperCase();
    return combined === courseCode;
};

/**
 * Performs a broad keyword search across the course title and code.
 *
 * @param course - The course record to evaluate.
 * @param text - The free-text keywords from the user.
 * @returns True if the keywords appear in the title or the code.
 */
export const courseMatchesText = (course: ApiCourseWithDepartment, text?: string) => {
    if (!text) return true;

    // Normalize once for the entire check
    const lowerSearch = text.toLowerCase().trim();

    return (
        course.title.toLowerCase().includes(lowerSearch) ||
        course.code.toLowerCase().includes(lowerSearch)
    );
};
