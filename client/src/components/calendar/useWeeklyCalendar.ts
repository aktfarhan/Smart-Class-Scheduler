import { useDragToSwap } from './useDragToSwap';
import { getCategory } from '../../utils/getCategory';
import { formatTime, meetingToMinutes } from '../../utils/formatTime';
import { getInstructorNames } from '../../utils/formatInstructorNames';
import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { assignColumns, resolveBlockConflicts } from './resolveBlockConflicts';
import type { ApiSectionWithRelations, Block, GhostBlockData } from '../../types';
import {
    CALENDAR_CONFIG,
    COURSE_COLORS,
    type CourseColor,
    type AcademicTerm,
} from '../../constants';

interface UseWeeklyCalendarParams {
    showWeekend: boolean;
    selectedTerm: AcademicTerm;
    selectedSections: Set<number>;
    sectionsByCourseId: Map<number, ApiSectionWithRelations[]>;
    onSectionSwap: (courseId: number, sectionId: number) => void;
}

export function useWeeklyCalendar({
    showWeekend,
    selectedTerm,
    selectedSections,
    sectionsByCourseId,
    onSectionSwap,
}: UseWeeklyCalendarParams) {
    const { START_TIME, TOTAL_MINS, ALL_DAYS, WEEK_DAYS } = CALENDAR_CONFIG;

    // ----- UI State -----
    const days = showWeekend ? ALL_DAYS : WEEK_DAYS;
    const [gridWidth, setGridWidth] = useState(0);
    const [popover, setPopover] = useState<Block | null>(null);

    // Columns wider than 200px show course code + time on one line
    const isWide = gridWidth / days.length >= 200;

    // ----- Refs -----

    // Calendar grid ref used for pointer capture and layout measurements
    const gridRef = useRef<HTMLDivElement>(null);

    // ----- Data State -----

    // Builds calendar blocks, assigns course colors, and detects conflicts
    const { activeBlocks, courseColorMap } = useMemo(() => {
        const grouped: Record<string, Block[]> = {};
        const courseCodes = new Set<string>();

        // Pre-fill grouped with empty arrays for M-F or M-Su
        days.forEach((day) => (grouped[day] = []));

        // 1. Build blocks from selected sections, grouped by day
        for (const [courseId, sections] of sectionsByCourseId.entries()) {
            for (const section of sections) {
                if (!selectedSections.has(section.id)) continue;

                const courseCode = `${section.course.department.code} ${section.course.code}`;
                const instructors = getInstructorNames(section.instructors);
                courseCodes.add(courseCode);

                // Convert each meeting into a renderable block with time in minutes
                for (const meeting of section.meetings) {
                    if (!grouped[meeting.day]) continue;
                    const { startMins, endMins } = meetingToMinutes(meeting);

                    // Add block with layout defaults that the sweep-line overwrites
                    grouped[meeting.day].push({
                        courseId,
                        courseCode,
                        sectionId: section.id,
                        sectionNumber: section.sectionNumber,
                        day: meeting.day,
                        startMins,
                        endMins,
                        timeRange: formatTime(meeting),
                        instructors,
                        location: meeting.location,
                        columnIndex: 0,
                        totalColumns: 1,
                        hasConflict: false,
                    });
                }
            }
        }

        // 2. Detect conflicts and assign side-by-side columns
        resolveBlockConflicts(grouped, days);

        // 3. Assign a color to each course
        const colorMap = new Map<string, CourseColor>();
        [...courseCodes].sort().forEach((code, i) => {
            colorMap.set(code, COURSE_COLORS[i % COURSE_COLORS.length]);
        });

        return { activeBlocks: grouped, courseColorMap: colorMap };
    }, [selectedSections, sectionsByCourseId, days]);

    // ----- Action Handlers -----

    // Dismiss the popover when clicking the grid background or the X button
    const handlePopoverClose = useCallback(() => setPopover(null), []);

    // Toggle popover — close if clicking the same block, open/switch if clicking a different one
    const handleBlockClick = useCallback((e: React.MouseEvent, block: Block) => {
        e.stopPropagation();
        // Match by sectionId + day + startMins
        setPopover((prev) =>
            prev &&
            prev.sectionId === block.sectionId &&
            prev.day === block.day &&
            prev.startMins === block.startMins
                ? null
                : block,
        );
    }, []);

    // DragToSwap hook for swapping between alternative sections
    const dragToSwap = useDragToSwap({
        days,
        gridRef,
        selectedTerm,
        activeBlocks,
        sectionsByCourseId,
        onSectionSwap,
        onDragActivate: handlePopoverClose,
    });

    // Preview layout during drag — shows what the calendar looks like with ghosts sharing space
    const previewBlocks = useMemo(() => {
        const dragState = dragToSwap.state.dragState;
        const ghostData = dragToSwap.data.ghostData;
        // Only run when actively dragging and alternatives exist
        if (!dragState || !ghostData) return null;

        // Find the dragged section to remove it from the preview
        const draggedCourseId = dragState.block.courseId;
        const draggedCategory = getCategory(dragState.block.sectionNumber);

        // Build adjusted blocks + ghosts per day
        const result: Record<string, { blocks: Block[]; ghosts: GhostBlockData[] }> = {};

        for (const day of days) {
            // Remove the dragged section's blocks and reset layout values for a fresh sweep
            const blocks = activeBlocks[day]
                .filter(
                    (block) =>
                        !(
                            block.courseId === draggedCourseId &&
                            getCategory(block.sectionNumber) === draggedCategory
                        ),
                )
                .map((block) => ({
                    ...block,
                    columnIndex: 0,
                    totalColumns: 1,
                    hasConflict: false,
                }));

            // Clone ghosts with default column values before the sweep assigns them
            const ghosts = ghostData[day].map((ghost) => ({
                ...ghost,
                columnIndex: 0,
                totalColumns: 1,
            }));

            // Combine and assign columns so overlapping blocks and ghosts sit side-by-side
            assignColumns([...blocks, ...ghosts]);

            result[day] = { blocks, ghosts };
        }

        return result;
    }, [days, activeBlocks, dragToSwap.state.dragState, dragToSwap.data.ghostData]);

    // Compute popover position as CSS percentages so the browser repositions on resize
    const popoverPosition = useMemo(() => {
        if (!popover) return null;

        // Find which column the popover's block is in
        const dayIndex = days.indexOf(popover.day);
        if (dayIndex === -1) return null;

        // Width of each day column as a percentage
        const columnPercent = 100 / days.length;

        // Pixel gap between popover and block edge
        const gap = 8;

        // Show right for the first half of days, left for the second half
        const showRight = dayIndex < days.length / 2;

        // Vertical position clamped so the popover doesn't overflow the grid bottom
        const blockTopPercent = ((popover.startMins - START_TIME * 60) / TOTAL_MINS) * 100;

        return showRight
            ? {
                  top: `clamp(0px, ${blockTopPercent}%, calc(100% - 220px))`,
                  left: `calc(${(dayIndex + 1) * columnPercent}% + ${gap}px)`,
              }
            : {
                  top: `clamp(0px, ${blockTopPercent}%, calc(100% - 220px))`,
                  right: `calc(${(days.length - dayIndex) * columnPercent}% + ${gap}px)`,
              };
    }, [popover, days, START_TIME, TOTAL_MINS]);

    // ----- Effects -----

    // Track grid width for responsive block layout
    useEffect(() => {
        const element = gridRef.current;
        if (!element) return;

        // Update gridWidth on resize
        const observer = new ResizeObserver(([entry]) => {
            setGridWidth(entry.contentRect.width);
        });
        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    // Close popover when sections or weekend toggle change
    useEffect(() => {
        setPopover(null);
    }, [selectedSections, showWeekend]);

    // ----- Export state, data, refs, and actions -----
    return {
        state: { popover, isWide, ...dragToSwap.state },
        data: {
            days,
            activeBlocks,
            courseColorMap,
            popoverPosition,
            previewBlocks,
            ...dragToSwap.data,
        },
        refs: { gridRef, ...dragToSwap.refs },
        actions: {
            handleBlockClick,
            handlePopoverClose,
            ...dragToSwap.actions,
        },
    };
}
