import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useCatalogData } from './useCatalogData';
import { useFilterLogic } from './useFilterLogic';
import { useCoursePagination } from './useCoursePagination';
import { useCalendarSidebar } from '../components/calendar/calendarsidebar/useCalendarSidebar';

export function useAppController() {
    // Fetch core catalog data
    const { courses, sections, sectionsByCourseId, lookupData, isLoading } = useCatalogData();

    // Ref for scrollable container to reset scroll on pagination or search change
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // ----- UI State -----
    const [activeTab, setActiveTab] = useState<'catalog' | 'calendar'>('catalog');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [showWeekend, setShowWeekend] = useState(false);
    const [jumpValue, setJumpValue] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // ----- Data State -----
    // Tracking user selections: pinned courses, selected sections per course, expanded course IDs
    const [pinnedCourses, setPinnedCourses] = useState<Set<number>>(new Set());
    const [selectedSections, setSelectedSections] = useState<Set<number>>(new Set());
    const [expandedCourseIds, setExpandedCourseIds] = useState<Set<number>>(new Set());

    // Calendar side bar
    const calendarSidebar = useCalendarSidebar({
        sectionsByCourseId,
        setSelectedSections,
        pinnedCourses,
    });

    // Apply search + filters + pagination to catalog data
    const pagination = useCoursePagination({
        courses,
        sections,
        lookupData,
        searchQuery,
        pinnedCourses,
        currentPage,
    });

    const { handleSidebarFilter } = useFilterLogic({
        searchQuery,
        setSearchQuery,
        setCurrentPage,
        departmentMap: lookupData.departmentMap,
    });

    // Reset scroll position whenever page or search query changes
    useEffect(() => {
        scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentPage, searchQuery]);

    // ----- Action Handlers -----

    /**
     * Toggle section selection for a given course.
     * If the section is already selected, deselect it; otherwise select it.
     */
    const handleSectionSelect = useCallback(
        (courseId: number, sectionId: number) => {
            setSelectedSections((prev) => {
                const next = new Set(prev);

                const courseSections = sectionsByCourseId.get(courseId) || [];
                const targetSection = courseSections.find((s) => s.id === sectionId);

                if (!targetSection) return prev;

                // 1. Determine Category: 'L' for Lab, 'D' for Discussion, 'LEC' for everything else
                const getCategory = (secNum: string) => {
                    if (secNum.endsWith('L')) return 'LAB';
                    if (secNum.endsWith('D')) return 'DISC';
                    return 'LEC';
                };

                const targetCategory = getCategory(targetSection.sectionNumber);

                // 2. Clear out existing sections of the SAME CATEGORY for this course
                courseSections.forEach((s) => {
                    if (next.has(s.id) && getCategory(s.sectionNumber) === targetCategory) {
                        next.delete(s.id);
                    }
                });

                // 3. Toggle Logic
                if (!prev.has(sectionId)) {
                    next.add(sectionId);
                }

                return next;
            });
        },
        [sectionsByCourseId],
    );

    // Handle jumping to a specific page via input form submission
    const handleJumpPage = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            const page = parseInt(jumpValue);
            if (page >= 1 && page <= pagination.totalPages) {
                setCurrentPage(page);
                setJumpValue('');
            }
        },
        [jumpValue, pagination.totalPages],
    );

    // ----- Export state, data, refs, and actions -----
    return {
        state: {
            activeTab,
            searchQuery,
            currentPage,
            jumpValue,
            isPanelOpen,
            showWeekend,
            isGenerating,
            pinnedCourses,
            selectedSections,
            expandedCourseIds,
            totalPages: pagination.totalPages,
            totalResults: pagination.totalResults,
            calendarSidebar: calendarSidebar.state,
        },
        data: {
            courses,
            lookupData,
            isLoading,
            sectionsByCourseId,
            pagedCourses: pagination.pagedCourses,
            activeFilters: pagination.activeFilters,
            calendarSidebar: calendarSidebar.data,
        },
        refs: { scrollContainerRef, calendarSidebar: calendarSidebar.refs },
        actions: {
            setActiveTab,
            setSearchQuery,
            setCurrentPage,
            setJumpValue,
            setIsPanelOpen,
            setShowWeekend,
            setSelectedSections,
            setExpandedCourseIds,
            setPinnedCourses,
            handleSectionSelect,
            handleSidebarFilter,
            handleJumpPage,
            calendarSidebar: calendarSidebar.actions,
        },
    };
}

export type AppController = ReturnType<typeof useAppController>;
