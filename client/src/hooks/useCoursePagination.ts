import { useMemo } from 'react';
import type { ApiCourseWithSections, ApiSectionWithRelations } from '../types/index';
import { parseSearchInput } from '../filters/parseSearchInput';
import { applyFilters } from '../filters/applyFilters';
import type { LookupData } from '../types/index';

const PAGE_SIZE = 40;

interface useCoursePaginationProps {
    courses: ApiCourseWithSections[];
    sections: ApiSectionWithRelations[]
    lookupData: LookupData;
    searchQuery: string;
    currentPage: number;
    pinnedCourses: Set<number>;
}

export function useCoursePagination({
    courses,
    sections,
    lookupData,
    searchQuery,
    currentPage,
    pinnedCourses,
}: useCoursePaginationProps) {
    return useMemo(() => {
        // 1. Convert search string into structured filters (Dept, Course, Instructor, etc.)
        const { filters } = parseSearchInput(searchQuery, lookupData);

        // 2. Use the Filter Engine to handle complex logic (Days, Duration, etc.)
        const filtered = applyFilters(courses, sections, filters);

        // 3. Professional Sort: Keep pinned courses at the top
        const sorted = [...filtered].sort((a, b) => {
            const aPinned = pinnedCourses.has(a.id) ? 1 : 0;
            const bPinned = pinnedCourses.has(b.id) ? 1 : 0;
            return bPinned - aPinned;
        });

        // 4. Calculate Slices
        const start = (currentPage - 1) * PAGE_SIZE;

        return {
            pagedCourses: sorted.slice(start, start + PAGE_SIZE),
            totalPages: Math.max(1, Math.ceil(sorted.length / PAGE_SIZE)),
            totalResults: sorted.length,
            activeFilters: filters,
        };
    }, [courses, sections, lookupData, searchQuery, pinnedCourses, currentPage]);
}
