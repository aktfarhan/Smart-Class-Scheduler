import { useTimeRangeSlider } from './useTimeRangeSlider';
import { scheduleHasWeekend } from '../../../utils/scheduleHasWeekend';
import { generateSchedulesDFS } from '../../../scheduling/scheduler';
import { CALENDAR_CONFIG, UI_LIMITS } from '../../../constants';
import { pickDefaultSeason, type Season } from '../../../utils/academicYear';
import { useState, useMemo, useRef, useCallback, useEffect, startTransition } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { DayLiteral } from '../../../constants';
import type {
    AcademicTerm,
    ApiSectionWithRelations,
    CourseDiagnostic,
    ScoredSchedule,
} from '../../../types';
import {
    SORT_OPTIONS,
    rankBySortOption,
    scoreAllSchedules,
} from '../../../scheduling/scheduleScoring';

interface CalendarSideBarParams {
    academicYear: number;
    pinnedCourses: Set<number>;
    sectionsByCourseId: Map<number, ApiSectionWithRelations[]>;
    setShowWeekend: (val: boolean) => void;
    setSelectedSections: Dispatch<SetStateAction<Set<number>>>;
}

export function useCalendarSidebar({
    academicYear,
    pinnedCourses,
    sectionsByCourseId,
    setShowWeekend,
    setSelectedSections,
}: CalendarSideBarParams) {
    // ----- UI State -----
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isCoursesOpen, setIsCoursesOpen] = useState(false);

    // ----- Results State -----
    const [sortPreset, setSortPreset] = useState(0);
    const [hasGeneratedOnce, setHasGeneratedOnce] = useState(false);
    const [selectedResultIndex, setSelectedResultIndex] = useState(0);
    const [scoredSchedules, setScoredSchedules] = useState<ScoredSchedule[]>([]);
    const [scheduleFeedback, setScheduleFeedback] = useState<CourseDiagnostic[] | null>(null);

    // ----- Filter State -----
    const [selectedDays, setSelectedDays] = useState<DayLiteral[]>(CALENDAR_CONFIG.WEEK_DAYS);
    const [selectedSeason, setSelectedSeason] = useState<Season>(() => pickDefaultSeason());
    const [minimumGap, setMinimumGap] = useState<number>(UI_LIMITS.PRESETS[0]);

    // Derived term string
    const selectedTerm = useMemo(() => {
        const year = selectedSeason === 'Fall' ? academicYear : academicYear + 1;
        return `${year} ${selectedSeason}`;
    }, [academicYear, selectedSeason]);

    // Time Range slider
    const slider = useTimeRangeSlider({
        start: CALENDAR_CONFIG.START_TIME,
        end: CALENDAR_CONFIG.END_TIME,
    });
    const { timeRange } = slider.state;
    const { setTimeRange, onPointerDown, onPointerMove, onPointerUp } = slider.actions;

    // ----- Refs -----
    const pendingGenerateRef = useRef(false);
    const hoverRevertRef = useRef<Set<number> | null>(null);
    const committedScheduleRef = useRef<ScoredSchedule | null>(null);

    // ----- Derived State -----

    // Re-rank scored schedules whenever sort preset changes, cap at top 3
    const rankedSchedules = useMemo(
        () => rankBySortOption(scoredSchedules, SORT_OPTIONS[sortPreset]).slice(0, 3),
        [scoredSchedules, sortPreset],
    );

    // ----- Action Handlers -----

    // Commit a schedule as the active selection and show weekend columns if needed
    const commitSchedule = useCallback(
        (schedule: ScoredSchedule, index: number) => {
            // Any explicit commit invalidates a pending hover-revert snapshot
            hoverRevertRef.current = null;
            committedScheduleRef.current = schedule;
            setSelectedResultIndex(index);
            setSelectedSections(schedule.sectionIds);
            if (scheduleHasWeekend(schedule.sections)) setShowWeekend(true);
        },
        [setSelectedSections, setShowWeekend],
    );

    // Toggle a day in the selectedDays filter
    const toggleDay = useCallback((day: DayLiteral) => {
        setSelectedDays((prev) =>
            prev.includes(day) ? prev.filter((existing) => existing !== day) : [...prev, day],
        );
    }, []);

    // Build course list, run DFS, and show diagnostics on failure
    const handleGenerateSchedule = useCallback(() => {
        if (pinnedCourses.size === 0) return;

        // 1. Build the course list with course codes for diagnostic labels
        const coursesToSchedule = [...pinnedCourses].map((id) => {
            const allSections = sectionsByCourseId.get(id)!;
            const firstSection = allSections[0];
            const courseCode = `${firstSection.course.department.code} ${firstSection.course.code}`;
            return { id, sections: allSections, courseCode };
        });

        // 2. Run DFS inside a transition to keep the UI responsive
        startTransition(() => {
            const { schedules, diagnostics } = generateSchedulesDFS(coursesToSchedule, {
                timeRange,
                minimumGap,
                selectedDays,
                selectedTerm,
            });

            // 3. Surface diagnostics when no valid schedules exist
            if (schedules.length === 0) {
                setScoredSchedules([]);
                setSelectedResultIndex(0);
                setHasGeneratedOnce(false);
                setScheduleFeedback(diagnostics);
                setSelectedSections(new Set());
                hoverRevertRef.current = null;
                committedScheduleRef.current = null;
                return;
            }

            // 4. Score all results and commit the top-ranked schedule
            const scored = scoreAllSchedules(schedules);
            const ranked = rankBySortOption(scored, SORT_OPTIONS[sortPreset]);

            setScoredSchedules(scored);
            setHasGeneratedOnce(true);
            setScheduleFeedback(null);
            commitSchedule(ranked[0], 0);
        });
    }, [
        sectionsByCourseId,
        pinnedCourses,
        selectedDays,
        selectedTerm,
        minimumGap,
        timeRange,
        sortPreset,
        commitSchedule,
    ]);

    // Switch the term
    const handleTermChange = useCallback((term: AcademicTerm) => {
        const [, season] = term.split(' ');
        setSelectedSeason(season as Season);
    }, []);

    // Dismiss the schedule feedback overlay
    const handleDismissFeedback = useCallback(() => {
        setScheduleFeedback(null);
    }, []);

    // Change the sort order and commit the new #1 result
    const handleSortChange = useCallback(
        (index: number) => {
            setSortPreset(index);
            hoverRevertRef.current = null;

            if (scoredSchedules.length === 0) return;

            const ranked = rankBySortOption(scoredSchedules, SORT_OPTIONS[index]);
            const topSchedule = ranked[0];

            // Same schedule won the new preset — keep any drag-swaps, just update the rank position
            if (topSchedule === committedScheduleRef.current) {
                setSelectedResultIndex(0);
                return;
            }
            commitSchedule(topSchedule, 0);
        },
        [scoredSchedules, commitSchedule],
    );

    // Commit a specific ranked schedule to the calendar
    const handleResultSelect = useCallback(
        (index: number) => {
            // Skip re-commit so manual drag-swaps on the committed schedule are preserved
            if (index === selectedResultIndex) return;
            const schedule = rankedSchedules[index];
            if (!schedule) return;
            commitSchedule(schedule, index);
        },
        [rankedSchedules, selectedResultIndex, commitSchedule],
    );

    // Temporarily preview a ranked schedule on hover, revert on leave
    const handleResultHover = useCallback(
        (index: number | null) => {
            if (index !== null) {
                const schedule = rankedSchedules[index];
                if (!schedule) return;

                // Snapshot whatever is currently selected before overwriting with the preview
                setSelectedSections((current) => {
                    if (hoverRevertRef.current === null) hoverRevertRef.current = current;
                    return schedule.sectionIds;
                });

                // Show weekend columns when the preview includes Sa or Su
                if (scheduleHasWeekend(schedule.sections)) setShowWeekend(true);
            } else if (hoverRevertRef.current !== null) {
                setSelectedSections(hoverRevertRef.current);
                hoverRevertRef.current = null;
            }
        },
        [rankedSchedules, setSelectedSections, setShowWeekend],
    );

    // Apply suggested filter adjustments from diagnostics, then auto-generate
    const handleApplyFix = useCallback(() => {
        if (!scheduleFeedback) return;

        // 1. Collect needed filter adjustments from all failing courses
        const neededDays = new Set<DayLiteral>(selectedDays);
        let newStart = timeRange.start;
        let newEnd = timeRange.end;

        for (const diagnostic of scheduleFeedback) {
            // Add any missing days the course needs
            if (diagnostic.reason === 'noDays') {
                for (const day of diagnostic.availableDays) neededDays.add(day);
            } else if (diagnostic.reason === 'noTime') {
                // Floor to nearest 0.5h below the earliest start
                if (diagnostic.earliestStart !== null) {
                    newStart = Math.min(newStart, Math.floor(diagnostic.earliestStart / 30) / 2);
                }

                // Ceil to nearest 0.5h above the latest end
                if (diagnostic.latestEnd !== null) {
                    newEnd = Math.max(newEnd, Math.ceil(diagnostic.latestEnd / 30) / 2);
                }
            }
        }

        // 2. Apply days fix and show weekend columns if Sa or Su was added
        if (neededDays.size !== selectedDays.length) {
            setSelectedDays([...neededDays]);
            if (neededDays.has('Sa') || neededDays.has('Su')) {
                setShowWeekend(true);
            }
        }

        // 3. Apply time range fix
        if (newStart !== timeRange.start || newEnd !== timeRange.end) {
            setTimeRange({ start: newStart, end: newEnd });
        }

        // 4. Signal the effect to auto-generate after filters commit
        pendingGenerateRef.current = true;
    }, [scheduleFeedback, selectedDays, timeRange, setTimeRange, setShowWeekend]);

    // ----- Effects -----

    // Full reset on term change
    useEffect(() => {
        setSortPreset(0);
        setHasGeneratedOnce(false);
        setSelectedSections(new Set());
        setScoredSchedules([]);
        setSelectedResultIndex(0);
        setScheduleFeedback(null);
        hoverRevertRef.current = null;
        committedScheduleRef.current = null;
    }, [selectedTerm, setSelectedSections]);

    // Light clear on non-term filter changes + filter selectedSections to pinned courses
    useEffect(() => {
        setScoredSchedules([]);
        setSelectedResultIndex(0);
        setScheduleFeedback(null);
        hoverRevertRef.current = null;
        committedScheduleRef.current = null;

        // Fully hide the Results section once all courses are unpinned
        if (pinnedCourses.size === 0) setHasGeneratedOnce(false);

        // Remove blocks for unpinned courses, keep the rest
        setSelectedSections((prev) => {
            const next = new Set<number>();
            for (const sectionId of prev) {
                // Only walk pinned courses — much faster than scanning the full catalog
                for (const courseId of pinnedCourses) {
                    const sections = sectionsByCourseId.get(courseId);
                    if (sections?.some((section) => section.id === sectionId)) {
                        next.add(sectionId);
                        break;
                    }
                }
            }
            return next.size === prev.size ? prev : next;
        });
    }, [
        selectedDays,
        timeRange,
        minimumGap,
        pinnedCourses,
        sectionsByCourseId,
        setSelectedSections,
    ]);

    // Auto-generate after Fix applies new filter values
    useEffect(() => {
        if (!pendingGenerateRef.current) return;
        pendingGenerateRef.current = false;
        handleGenerateSchedule();
    }, [handleGenerateSchedule]);

    // ----- Export state, data, refs, and actions -----
    return {
        state: {
            expandedId,
            isFilterOpen,
            isCoursesOpen,
            selectedDays,
            selectedTerm,
            minimumGap,
            timeRange,
            sortPreset,
            scheduleFeedback,
            selectedResultIndex,
            sliderMin: CALENDAR_CONFIG.START_TIME,
            sliderMax: CALENDAR_CONFIG.END_TIME,
            daysList: CALENDAR_CONFIG.ALL_DAYS,
        },
        data: {
            rankedSchedules,
            hasGeneratedOnce,
            gapPresets: UI_LIMITS.PRESETS,
            maxGap: UI_LIMITS.MAX_GAP,
            totalScoredSchedules: scoredSchedules.length,
        },
        refs: {
            sliderRef: slider.refs.sliderRef,
        },
        actions: {
            setExpandedId,
            setIsFilterOpen,
            setIsCoursesOpen,
            setSelectedDays,
            setMinimumGap,
            setTimeRange,
            toggleDay,
            handleTermChange,
            handleApplyFix,
            handleSortChange,
            handleResultHover,
            handleResultSelect,
            handleDismissFeedback,
            onPointerDown,
            onPointerMove,
            onPointerUp,
            handleGenerateSchedule,
        },
    };
}

export type CalendarSidebar = ReturnType<typeof useCalendarSidebar>;
