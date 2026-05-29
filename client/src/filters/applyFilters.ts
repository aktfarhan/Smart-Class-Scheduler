import * as CourseFilters from './coursePredicates';
import * as SectionFilters from './sectionPredicates';
import type { SearchFilters, ApiCourseWithSections, ApiSectionWithRelations } from '../types';

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
            SectionFilters.sectionMatchesTermContext(section, filters.term, filters.academicYear) &&
            SectionFilters.sectionMatchesType(section, filters.sectionType) &&
            SectionFilters.sectionMatchesInstructor(section, filters.instructorName) &&
            SectionFilters.sectionMatchesDays(section, filters.days) &&
            SectionFilters.sectionMatchesDuration(section, filters.duration) &&
            SectionFilters.sectionMatchesTimeRange(section, filters.timeRange),
    );

    // Create a list of IDs for all sections that passed the schedule filters
    const validSectionIds = new Set(validSections.map((section) => section.id));

    return courses.filter((course) => {
        // Check for a match on the course name, department, or code
        const isBasicMatch =
            CourseFilters.courseMatchesDept(course, filters.departmentCode) &&
            CourseFilters.courseMatchesCode(course, filters.courseCode) &&
            CourseFilters.courseMatchesText(course, filters.text);

        if (!isBasicMatch) return false;

        // Course must have at least one section that survived the section-level filters
        return course.sections.some((section) => validSectionIds.has(section.id));
    });
}
