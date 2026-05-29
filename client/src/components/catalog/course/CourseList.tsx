import React, { useCallback, useMemo } from 'react';
import Course from './Course';
import { Search } from 'lucide-react';
import SkeletonCourseCard from './SkeletonCourseCard';
import * as SectionRules from '../../../filters/sectionPredicates';
import type { SearchFilters } from '../../../types';
import type { ApiCourseWithDepartment, ApiSectionWithRelations } from '../../../types';

interface CourseListProps {
    isLoading: boolean;
    pagedCourses: ApiCourseWithDepartment[];
    activeFilters: SearchFilters;
    pinnedCourses: Set<number>;
    expandedCourseIds: Set<number>;
    sectionsByCourseId: Map<number, ApiSectionWithRelations[]>;
    setPinnedCourses: React.Dispatch<React.SetStateAction<Set<number>>>;
    setExpandedCourseIds: React.Dispatch<React.SetStateAction<Set<number>>>;
}

function CourseList({
    isLoading,
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
                    SectionRules.sectionMatchesTermContext(
                        section,
                        activeFilters.term,
                        activeFilters.academicYear,
                    ) &&
                    SectionRules.sectionMatchesType(section, activeFilters.sectionType) &&
                    SectionRules.sectionMatchesInstructor(section, activeFilters.instructorName) &&
                    SectionRules.sectionMatchesDays(section, activeFilters.days) &&
                    SectionRules.sectionMatchesDuration(section, activeFilters.duration) &&
                    SectionRules.sectionMatchesTimeRange(section, activeFilters.timeRange),
            );
            // Store filtered sections for this course
            map.set(course.id, filtered);
        });
        return map;
    }, [pagedCourses, activeFilters, sectionsByCourseId]);

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

    // Skeleton loading state — render enough to overflow, parent clips with overflow-hidden
    if (isLoading) {
        return (
            <div className="flex flex-col">
                {Array.from({ length: 10 }).map((_, i) => (
                    <SkeletonCourseCard key={i} />
                ))}
            </div>
        );
    }

    // Empty state when no courses match the current search
    if (pagedCourses.length === 0) {
        return (
            <div className="mx-4 mt-4 flex max-w-7xl flex-col items-center justify-center rounded-2xl border-2 border-slate-200 py-16 select-none sm:mx-10">
                <Search size={40} className="mb-3 text-slate-300" />
                <p className="text-base font-semibold tracking-tight text-slate-400">
                    No courses match your search
                </p>
                <p className="mt-1 text-xs text-slate-300">Try adjusting your search or filters</p>
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
