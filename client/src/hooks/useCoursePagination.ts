import { useMemo } from 'react';
import type { LookupData } from '../types/index';
import { applyFilters } from '../filters/applyFilters';
import { parseSearchInput } from '../filters/parseSearchInput';
import type { ApiCourseWithSections, ApiSectionWithRelations, SearchFilters } from '../types/index';

const PAGE_SIZE = 25;

interface useCoursePaginationProps {
    courses: ApiCourseWithSections[];
    sections: ApiSectionWithRelations[];
    lookupData: LookupData;
    searchQuery: string;
    currentPage: number;
    academicYear: number;
    pinnedCourses: Set<number>;
}

export function useCoursePagination({
    courses,
    sections,
    lookupData,
    searchQuery,
    currentPage,
    academicYear,
    pinnedCourses,
}: useCoursePaginationProps) {
    return useMemo(() => {
        // 1. Convert search string into structured filters (Dept, Course, Instructor, etc.)
        const { filters: parsed } = parseSearchInput(searchQuery, lookupData);

        // 2. Merge the AY context
        const filters: SearchFilters = { ...parsed, academicYear };

        // 3. Apply filters to get matching courses
        const filtered = applyFilters(courses, sections, filters);

        // 4. Pinned courses first
        const sorted = [...filtered].sort((a, b) => {
            const aPinned = pinnedCourses.has(a.id) ? 1 : 0;
            const bPinned = pinnedCourses.has(b.id) ? 1 : 0;
            return bPinned - aPinned;
        });

        // 5. Calculate Slices
        const start = (currentPage - 1) * PAGE_SIZE;

        return {
            pagedCourses: sorted.slice(start, start + PAGE_SIZE),
            totalPages: Math.max(1, Math.ceil(sorted.length / PAGE_SIZE)),
            totalResults: sorted.length,
            activeFilters: filters,
        };
    }, [courses, sections, lookupData, searchQuery, pinnedCourses, currentPage, academicYear]);
}
