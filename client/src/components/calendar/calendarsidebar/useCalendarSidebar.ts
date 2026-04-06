import { generateSchedulesDFS } from '../../../scheduler';
import { CALENDAR_CONFIG, ACADEMIC_TERMS, UI_LIMITS } from '../../../constants';
import { useState, useRef, useCallback, useEffect, useMemo, startTransition } from 'react';
import type { DayLiteral, AcademicTerm } from '../../../constants';
import type { Dispatch, SetStateAction, PointerEvent as ReactPointerEvent } from 'react';
import type { ApiSectionWithRelations, TimeRange, CourseDiagnostic } from '../../../types';

interface CalendarSideBarParams {
    pinnedCourses: Set<number>;
    sectionsByCourseId: Map<number, ApiSectionWithRelations[]>;
    setShowWeekend: (val: boolean) => void;
    setSelectedSections: Dispatch<SetStateAction<Set<number>>>;
}

export function useCalendarSidebar({
    pinnedCourses,
    sectionsByCourseId,
    setShowWeekend,
    setSelectedSections,
}: CalendarSideBarParams) {
    // ----- UI State -----
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isCoursesOpen, setIsCoursesOpen] = useState(false);
    const [generatedSchedules, setGeneratedSchedules] = useState<ApiSectionWithRelations[][]>([]);
    const [scheduleFeedback, setScheduleFeedback] = useState<CourseDiagnostic[] | null>(null);

    // ----- Filter & Range State -----
    const initialDays = useMemo(() => [...CALENDAR_CONFIG.WEEK_DAYS], []);
    const [selectedDays, setSelectedDays] = useState<DayLiteral[]>(initialDays);
    const [selectedTerm, setSelectedTerm] = useState<AcademicTerm>(ACADEMIC_TERMS.TERMS[2]);
    const [minimumGap, setMinimumGap] = useState<number>(UI_LIMITS.PRESETS[0]);
    const [timeRange, setTimeRange] = useState<TimeRange>({
        start: CALENDAR_CONFIG.START_TIME,
        end: CALENDAR_CONFIG.END_TIME,
    });

    // ----- Refs -----
    const sliderRef = useRef<HTMLDivElement | null>(null);
    const draggingRef = useRef<'start' | 'end' | null>(null);
    const trackRectRef = useRef<DOMRect | null>(null);
    const pendingGenerateRef = useRef(false);

    // ----- Action Handlers -----

    // Toggle a day in the selectedDays filter
    const toggleDay = useCallback((day: DayLiteral) => {
        setSelectedDays((prev) =>
            // if the day is already selected, remove it; otherwise add it
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
                setGeneratedSchedules([]);
                setScheduleFeedback(diagnostics);
                setSelectedSections(new Set());
                return;
            }

            // 4. Save valid combinations and select the first path
            const firstSchedule = schedules[0];
            setGeneratedSchedules(schedules);
            setScheduleFeedback(null);
            setSelectedSections(new Set(firstSchedule.map((section) => section.id)));

            // 5. Show weekend columns if the schedule includes Sa or Su
            const hasWeekend = firstSchedule.some((section) =>
                section.meetings.some((meeting) => meeting.day === 'Sa' || meeting.day === 'Su'),
            );
            if (hasWeekend) setShowWeekend(true);
        });
    }, [
        sectionsByCourseId,
        pinnedCourses,
        selectedDays,
        selectedTerm,
        minimumGap,
        timeRange,
        setShowWeekend,
        setSelectedSections,
    ]);

    // Clear all selections when switching terms since schedules are term-specific
    const handleTermChange = useCallback(
        (newTerm: AcademicTerm) => {
            setSelectedTerm(newTerm);
            setSelectedSections(new Set());
        },
        [setSelectedSections],
    );

    const updateSliderValue = useCallback((clientX: number) => {
        if (!draggingRef.current || !trackRectRef.current) return;

        // Capture which thumb is active now, before the async state update
        const thumb = draggingRef.current;

        // Use the cached rect from the element that received the pointer down
        const rect = trackRectRef.current;

        // Convert pointer position to a 0–1 percentage
        const percent = Math.min(Math.max(0, (clientX - rect.left) / rect.width), 1);

        // Convert percentage to time value
        const range = CALENDAR_CONFIG.END_TIME - CALENDAR_CONFIG.START_TIME;
        const rawValue = CALENDAR_CONFIG.START_TIME + percent * range;

        // Snap to nearest 0.5 hour increment
        const newValue = Math.round(rawValue * 2) / 2;

        setTimeRange((prev) => {
            // Update start thumb, clamped to stay before end
            if (thumb === 'start') {
                return { ...prev, start: Math.min(newValue, prev.end - 1) };
            }

            // Update end thumb, clamped to stay after start
            return { ...prev, end: Math.max(newValue, prev.start + 1) };
        });
    }, []);

    // Determines which thumb is closer to the tap and captures the pointer to the track
    const onPointerDown = useCallback(
        (e: ReactPointerEvent) => {
            if (e.button !== 0) return;
            e.preventDefault();

            // Cache the rect from the actual visible element that received the event
            trackRectRef.current = e.currentTarget.getBoundingClientRect();

            // Calculate which thumb is closer to the tapped position
            const rect = trackRectRef.current;
            const percent = (e.clientX - rect.left) / rect.width;
            const range = CALENDAR_CONFIG.END_TIME - CALENDAR_CONFIG.START_TIME;
            const tappedValue = CALENDAR_CONFIG.START_TIME + percent * range;

            const distToStart = Math.abs(tappedValue - timeRange.start);
            const distToEnd = Math.abs(tappedValue - timeRange.end);
            draggingRef.current = distToStart <= distToEnd ? 'start' : 'end';

            e.currentTarget.setPointerCapture(e.pointerId);
            updateSliderValue(e.clientX);
        },
        [timeRange, updateSliderValue],
    );

    // Updates the slider value as the pointer moves (only while dragging)
    const onPointerMove = useCallback(
        (e: ReactPointerEvent) => {
            if (!draggingRef.current) return;
            updateSliderValue(e.clientX);
        },
        [updateSliderValue],
    );

    // Resets drag state when the pointer is released or capture is lost
    const onPointerUp = useCallback(() => {
        draggingRef.current = null;
    }, []);

    // Dismiss the schedule feedback overlay
    const handleDismissFeedback = useCallback(() => {
        setScheduleFeedback(null);
    }, []);

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
    }, [scheduleFeedback, selectedDays, timeRange, setShowWeekend]);

    // ----- Effects -----

    // Dismiss schedule feedback when any filter or pinned course changes
    useEffect(() => {
        setScheduleFeedback(null);

        // Auto-generate after Fix applies new filter values
        if (pendingGenerateRef.current) {
            pendingGenerateRef.current = false;
            handleGenerateSchedule();
        }
    }, [selectedTerm, selectedDays, timeRange, minimumGap, pinnedCourses, handleGenerateSchedule]);

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
            generatedSchedules,
            scheduleFeedback,
            sliderMin: CALENDAR_CONFIG.START_TIME,
            sliderMax: CALENDAR_CONFIG.END_TIME,
            daysList: CALENDAR_CONFIG.ALL_DAYS,
        },
        data: {
            availableTerms: ACADEMIC_TERMS.TERMS,
            gapPresets: UI_LIMITS.PRESETS,
            maxGap: UI_LIMITS.MAX_GAP,
        },
        refs: {
            sliderRef,
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
            handleDismissFeedback,
            onPointerDown,
            onPointerMove,
            onPointerUp,
            handleGenerateSchedule,
        },
    };
}

export type CalendarSidebar = ReturnType<typeof useCalendarSidebar>;
