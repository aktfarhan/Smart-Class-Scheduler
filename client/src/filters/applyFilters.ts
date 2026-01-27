import type { ApiCourseWithSections, ApiSectionWithRelations } from '../types';
import type { SearchFilters } from '../types';
import * as CourseFilters from './coursePredicates';
import * as SectionFilters from './sectionPredicates';

/**
 * Filters the course catalog at course-level and section-level.
 *
 * @param courses - The list of courses.
 * @param sections - The list of sections.
 * @param filters - The current filters.
 * @returns A filtered array of courses.
 */
export function applyFilters(
    courses: ApiCourseWithSections[],
    sections: ApiSectionWithRelations[],
    filters: SearchFilters,
) {
    // Find all sections that fit the filters
    const validSections = sections.filter(
        (section) =>
            SectionFilters.sectionMatchesTerm(section, filters.term) &&
            SectionFilters.sectionMatchesInstructor(section, filters.instructorName) &&
            SectionFilters.sectionMatchesDays(section, filters.days) &&
            SectionFilters.sectionMatchesDuration(section, filters.duration),
    );

    // Create a list of IDs for all sections that passed the schedule filters
    const validSectionIds = new Set(validSections.map((section) => section.id));

    // Check if the user is filtering by sections; if they aren't, skip checking sections
    const hasSectionFilters = Boolean(
        filters.term || filters.instructorName || filters.days?.length || filters.duration,
    );

    // Filter courses based on metadata
    return courses.filter((course) => {
        // Check for a match on the course name, department, or code
        const isBasicMatch =
            CourseFilters.courseMatchesDept(course, filters.departmentCode) &&
            CourseFilters.courseMatchesCode(course, filters.courseCode) &&
            CourseFilters.courseMatchesText(course, filters.text);

        if (!isBasicMatch) return false;

        // If no scheduling filters are active, filter course-level
        if (!hasSectionFilters) return true;

        // Ensure the course has at least one valid section for the active filters.
        return course.sections?.some((s) => validSectionIds.has(s.id)) ?? false;
    });
}
