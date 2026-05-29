import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useCatalogData } from './useCatalogData';
import { useFilterLogic } from './useFilterLogic';
import { getCategory } from '../utils/getCategory';
import { useCoursePagination } from './useCoursePagination';
import { getCurrentAYStart, rewriteTermTokens } from '../utils/academicYear';
import { useCalendarSidebar } from '../components/calendar/calendarsidebar/useCalendarSidebar';

export function useAppController() {
    // Fetch core catalog data
    const { courses, sections, sectionsByCourseId, lookupData, lastUpdatedAt, isLoading } =
        useCatalogData();

    // Ref for scrollable container to reset scroll on pagination or search change
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // ----- UI State -----
    const [activeTab, setActiveTab] = useState<'catalog' | 'calendar'>('catalog');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [showWeekend, setShowWeekend] = useState(false);
    const [jumpValue, setJumpValue] = useState('');
    const [academicYear, setAcademicYear] = useState<number>(() => getCurrentAYStart());

    // ----- Data State -----
    // Tracking user selections: pinned courses, selected sections per course, expanded course IDs
    const [pinnedCourses, setPinnedCourses] = useState<Set<number>>(new Set());
    const [selectedSections, setSelectedSections] = useState<Set<number>>(new Set());
    const [expandedCourseIds, setExpandedCourseIds] = useState<Set<number>>(new Set());

    // Calendar side bar
    const calendarSidebar = useCalendarSidebar({
        academicYear,
        pinnedCourses,
        sectionsByCourseId,
        setShowWeekend,
        setSelectedSections,
    });

    // Apply search + filters + pagination to catalog data
    const pagination = useCoursePagination({
        courses,
        sections,
        lookupData,
        searchQuery,
        currentPage,
        academicYear,
        pinnedCourses,
    });

    const { handleSidebarFilter } = useFilterLogic({
        lookupData,
        setSearchQuery,
        setCurrentPage,
    });

    // Reset scroll position whenever page, search query, or AY changes
    useEffect(() => {
        scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentPage, searchQuery, academicYear]);

    // Update browser tab title when switching between Catalog and Calendar
    useEffect(() => {
        document.title = `UMBWizard – ${activeTab === 'catalog' ? 'Catalog' : 'Calendar'}`;
    }, [activeTab]);

    // ----- Derived State -----

    // True when any selected section meets on Sa or Su
    const hasWeekendSections = useMemo(
        () =>
            sections.some(
                (section) =>
                    selectedSections.has(section.id) &&
                    section.meetings.some(
                        (meeting) => meeting.day === 'Sa' || meeting.day === 'Su',
                    ),
            ),
        [sections, selectedSections],
    );

    // ----- Action Handlers -----

    // Switch the academic year, and any term tokens in the search bar
    const handleAcademicYearChange = useCallback((newAY: number) => {
        setSearchQuery((prev) => rewriteTermTokens(prev, newAY));
        setAcademicYear(newAY);
        setCurrentPage(1);
    }, []);

    /**
     * Toggle section selection for a given course.
     * Picking a new section of the same category (lecture, lab, discussion) deselects the previous one.
     */
    const handleSectionSelect = useCallback(
        (courseId: number, sectionId: number) => {
            setSelectedSections((prev) => {
                const next = new Set(prev);

                const courseSections = sectionsByCourseId.get(courseId)!;
                const targetSection = courseSections.find((section) => section.id === sectionId)!;
                const targetCategory = getCategory(targetSection.sectionNumber);

                // 1. Clear existing sections of the SAME category for this course
                courseSections.forEach((section) => {
                    if (
                        next.has(section.id) &&
                        getCategory(section.sectionNumber) === targetCategory
                    ) {
                        next.delete(section.id);
                    }
                });

                // 2. Toggle target, add if wasn't already selected
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
            academicYear,
            pinnedCourses,
            selectedSections,
            expandedCourseIds,
            hasWeekendSections,
            totalPages: pagination.totalPages,
            totalResults: pagination.totalResults,
            calendarSidebar: calendarSidebar.state,
        },
        data: {
            courses,
            lookupData,
            isLoading,
            lastUpdatedAt,
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
            handleAcademicYearChange,
            handleSectionSelect,
            handleSidebarFilter,
            handleJumpPage,
            calendarSidebar: calendarSidebar.actions,
        },
    };
}

export type AppController = ReturnType<typeof useAppController>;
