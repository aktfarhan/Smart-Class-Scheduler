import React, { useCallback, useMemo } from 'react';
import Course from './Course';
import { Search } from 'lucide-react';
import * as SectionRules from '../../../filters/sectionPredicates';
import type { SearchFilters } from '../../../filters/parseSearchInput';
import type { ApiCourseWithDepartment, ApiSectionWithRelations } from '../../../types';

interface CourseListProps {
    pagedCourses: ApiCourseWithDepartment[];
    activeFilters: SearchFilters;
    pinnedCourses: Set<number>;
    expandedCourseIds: Set<number>;
    sectionsByCourseId: Map<number, ApiSectionWithRelations[]>;
    setPinnedCourses: React.Dispatch<React.SetStateAction<Set<number>>>;
    setExpandedCourseIds: React.Dispatch<React.SetStateAction<Set<number>>>;
}

function CourseList({
    pagedCourses,
    activeFilters,
    pinnedCourses,
    setPinnedCourses,
    expandedCourseIds,
    sectionsByCourseId,
    setExpandedCourseIds,
}: CourseListProps) {
    // Build a map of courseId -> filtered sections based on active filters
    const filteredSectionsMap = useMemo(() => {
        const map = new Map<number, ApiSectionWithRelations[]>();
        pagedCourses.forEach((course) => {
            // Get all sections for this course
            const rawSections = sectionsByCourseId.get(course.id) ?? [];

            // Apply all active section-level filters
            const filtered = rawSections.filter(
                (section) =>
                    SectionRules.sectionMatchesTerm(section, activeFilters.term) &&
                    SectionRules.sectionMatchesInstructor(section, activeFilters.instructorName) &&
                    SectionRules.sectionMatchesDays(section, activeFilters.days) &&
                    SectionRules.sectionMatchesDuration(section, activeFilters.duration),
            );
            // Store filtered sections for this course
            map.set(course.id, filtered);
        });
        return map;
    }, [pagedCourses, activeFilters]);

    // Toggle a course's pinned state by ID
    const handleTogglePin = useCallback(
        (id: number) => {
            setPinnedCourses((prev) => {
                const next = new Set(prev);
                next.has(id) ? next.delete(id) : next.add(id);
                return next;
            });
        },
        [setPinnedCourses],
    );

    // Toggle whether a course's sections are expanded
    const handleToggleExpand = useCallback(
        (id: number) => {
            setExpandedCourseIds((prev) => {
                const next = new Set(prev);
                next.has(id) ? next.delete(id) : next.add(id);
                return next;
            });
        },
        [setExpandedCourseIds],
    );

    // Empty state when no courses match the current search
    if (pagedCourses.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Search size={48} className="mb-4 opacity-10" />
                <p className="text-lg font-medium tracking-tight">No courses match your search</p>
            </div>
        );
    }
    return (
        <div className="flex flex-col">
            {pagedCourses.map((course) => (
                <Course
                    key={course.id}
                    course={course}
                    sections={filteredSectionsMap.get(course.id) ?? []}
                    isPinned={pinnedCourses.has(course.id)}
                    isSectionExpanded={expandedCourseIds.has(course.id)}
                    onTogglePin={() => handleTogglePin(course.id)}
                    onToggleSectionExpand={() => handleToggleExpand(course.id)}
                />
            ))}
        </div>
    );
}

export default CourseList;
