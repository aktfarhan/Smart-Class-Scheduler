import { useState, useRef, useCallback, useMemo, startTransition } from 'react';
import { CALENDAR_CONFIG, ACADEMIC_TERMS, UI_LIMITS } from '../../../constants';
import type { Dispatch, SetStateAction, PointerEvent as ReactPointerEvent } from 'react';
import type { ApiSectionWithRelations, Day, TimeRange } from '../../../types';
import type { DayLiteral, AcademicTerm } from '../../../constants';
import { generateSchedulesDFS } from '../../../scheduler';

interface CalendarSideBarParams {
    sectionsByCourseId: Map<number, ApiSectionWithRelations[]>;
    setSelectedSections: Dispatch<SetStateAction<Set<number>>>;
    pinnedCourses: Set<number>;
}

export function useCalendarSidebar({
    sectionsByCourseId,
    setSelectedSections,
    pinnedCourses,
}: CalendarSideBarParams) {
    // ----- UI State -----
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [generatedSchedules, setGeneratedSchedules] = useState<ApiSectionWithRelations[][]>([]);

    // ----- Filter & Range State -----
    const initialDays = useMemo(() => [...CALENDAR_CONFIG.WEEK_DAYS], []);
    const [selectedDays, setSelectedDays] = useState<DayLiteral[]>(initialDays);
    const [selectedTerm, setSelectedTerm] = useState<AcademicTerm>(ACADEMIC_TERMS.TERMS[2]);
    const [minimumGap, setMinimumGap] = useState<number>(UI_LIMITS.PRESETS[1]);
    const [timeRange, setTimeRange] = useState<TimeRange>({
        start: CALENDAR_CONFIG.START_TIME,
        end: CALENDAR_CONFIG.END_TIME,
    });

    // ----- Refs -----
    const sliderRef = useRef<HTMLDivElement | null>(null);
    const draggingRef = useRef<'start' | 'end' | null>(null);

    // ----- Action Handlers -----

    // Toggle a day in the selectedDays filter
    const toggleDay = useCallback((day: DayLiteral) => {
        setSelectedDays((prev) =>
            // if the day is already selected, remove it; otherwise add it
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
        );
    }, []);

    const handleGenerateSchedule = useCallback(() => {
        const coursesToSchedule = Array.from(pinnedCourses).map((id) => {
            const allSections = sectionsByCourseId.get(id) || [];
            return {
                id,
                sections: allSections.filter((s) => s.meetings && s.meetings.length > 0),
            };
        });
        const impossibleCourse = coursesToSchedule.find((c) => c.sections.length === 0);
        if (impossibleCourse) {
            console.warn(`Course ${impossibleCourse.id} has no valid sections with times.`);
            setGeneratedSchedules([]);
            setSelectedSections(new Set());
            return;
        }

        if (coursesToSchedule.length === 0) return;

        startTransition(() => {
            const results = generateSchedulesDFS(coursesToSchedule, {
                selectedDays,
                selectedTerm,
                minimumGap,
                timeRange,
            });
            if (results.length > 0) {
                setGeneratedSchedules(results);
                const firstValidPath = results[0];
                const newSelection = new Set<number>(firstValidPath.map((s) => s.id));
                setSelectedSections(newSelection);
            } else {
                setGeneratedSchedules([]);
                setSelectedSections(new Set());
                console.error('Strict constraints met: No valid schedules possible.');
            }
        });
    }, [
        sectionsByCourseId,
        pinnedCourses,
        selectedDays,
        selectedTerm,
        minimumGap,
        timeRange,
        setSelectedSections,
    ]);

    // Updates the active term and removes sections that are no longer valid for that term
    const handleTermChange = useCallback(
        (newTerm: AcademicTerm) => {
            setSelectedTerm(newTerm);
            setSelectedSections((prev) => {
                const next = new Set(prev);
                let hasChanges = false;

                // Check every ID in the current selection
                next.forEach((sectionId) => {
                    // Find the section across all courses in this Map
                    let sectionFound = false;
                    for (const sections of sectionsByCourseId.values()) {
                        const s = sections.find((sec) => sec.id === sectionId);
                        if (s && s.term === newTerm) {
                            sectionFound = true;
                            break;
                        }
                    }

                    if (!sectionFound) {
                        next.delete(sectionId);
                        hasChanges = true;
                    }
                });

                return hasChanges ? next : prev;
            });
        },
        [sectionsByCourseId, setSelectedSections],
    );

    const updateSliderValue = useCallback((clientX: number) => {
        if (!draggingRef.current || !sliderRef.current) return;

        // Get slider bounds
        const rect = sliderRef.current.getBoundingClientRect();

        // Convert pointer position to a 0–1 percentage
        const percent = Math.min(Math.max(0, (clientX - rect.left) / rect.width), 1);

        // Convert percentage to time value
        const range = CALENDAR_CONFIG.END_TIME - CALENDAR_CONFIG.START_TIME;
        const rawValue = CALENDAR_CONFIG.START_TIME + percent * range;

        // Snap to nearest 0.5 hour increment
        const newValue = Math.round(rawValue * 2) / 2;

        setTimeRange((prev) => {
            // Update start thumb, clamped to stay before end
            if (draggingRef.current === 'start') {
                return { ...prev, start: Math.min(newValue, prev.end - 1) };
            }

            // Update end thumb, clamped to stay after start
            return { ...prev, end: Math.max(newValue, prev.start + 1) };
        });
    }, []);

    const onPointerDown = useCallback(
        (thumb: 'start' | 'end') => (e: ReactPointerEvent) => {
            if (e.button !== 0) return;
            e.preventDefault();
            // Mark which thumb is being dragged
            draggingRef.current = thumb;

            // Handle pointer movement
            const handlePointerMove = (moveEvent: PointerEvent) =>
                updateSliderValue(moveEvent.clientX);

            // Cleanup when dragging ends
            const handlePointerUp = () => {
                draggingRef.current = null;
                window.removeEventListener('pointermove', handlePointerMove);
                window.removeEventListener('pointerup', handlePointerUp);
            };

            // Attach global listeners
            window.addEventListener('pointermove', handlePointerMove);
            window.addEventListener('pointerup', handlePointerUp);
        },
        [updateSliderValue],
    );

    // ----- Export state, data, refs, and actions -----
    return {
        state: {
            expandedId,
            isFilterOpen,
            selectedDays,
            selectedTerm,
            minimumGap,
            timeRange,
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
            setSelectedDays,
            setMinimumGap,
            setTimeRange,
            toggleDay,
            handleTermChange,
            onPointerDown,
            handleGenerateSchedule,
        },
    };
}

export type CalendarSidebar = ReturnType<typeof useCalendarSidebar>;
