import { getCategory } from '../../utils/getCategory';
import { formatTime, meetingToMinutes } from '../../utils/formatTime';
import { useMemo, useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { CALENDAR_CONFIG, type AcademicTerm } from '../../constants';
import type {
    Day,
    Block,
    DragState,
    PendingDrag,
    GhostBlockData,
    ApiSectionWithRelations,
} from '../../types';

interface UseDragToSwapParams {
    days: Day[];
    gridRef: React.RefObject<HTMLDivElement | null>;
    selectedTerm: AcademicTerm;
    activeBlocks: Record<string, Block[]>;
    sectionsByCourseId: Map<number, ApiSectionWithRelations[]>;
    onSectionSwap: (courseId: number, sectionId: number) => void;
    onDragActivate: () => void;
}

export function useDragToSwap({
    days,
    gridRef,
    selectedTerm,
    activeBlocks,
    sectionsByCourseId,
    onSectionSwap,
    onDragActivate,
}: UseDragToSwapParams) {
    const { START_TIME, TOTAL_MINS } = CALENDAR_CONFIG;

    // ----- UI State -----

    // Track active drag info, hovered ghost, and recently swapped section
    const [dragState, setDragState] = useState<DragState | null>(null);
    const [hoveredGhostId, setHoveredGhostId] = useState<number | null>(null);
    const [swappedSectionId, setSwappedSectionId] = useState<number | null>(null);

    // ----- Refs -----

    // Store the floating clone element and pointer-down info before drag starts
    const cloneRef = useRef<HTMLDivElement>(null);
    const pendingDragRef = useRef<PendingDrag | null>(null);

    // ----- Data State -----

    // Build ghost blocks for alternative sections when dragging
    const ghostData = useMemo(() => {
        if (!dragState) return null;

        // Identify which course/section/category is being dragged
        const { sectionNumber, courseId, sectionId } = dragState.block;
        const category = getCategory(sectionNumber);

        // 1. Find same-category alternatives
        const alternatives = sectionsByCourseId
            .get(courseId)!
            .filter(
                (section) =>
                    section.id !== sectionId &&
                    section.term === selectedTerm &&
                    section.meetings.length > 0 &&
                    getCategory(section.sectionNumber) === category,
            );
        if (alternatives.length === 0) return null;

        // Prepare day buckets for ghost blocks
        const grouped: Record<string, GhostBlockData[]> = {};
        days.forEach((day) => (grouped[day] = []));

        // 2. Build ghost blocks with conflict detection
        for (const section of alternatives) {
            const parsedMeetings = [];

            // Convert each meeting for grid positioning
            for (const meeting of section.meetings) {
                // Skip meetings on Sa/Sun if hidden
                if (!grouped[meeting.day]) continue;
                const { startMins, endMins } = meetingToMinutes(meeting);
                parsedMeetings.push({
                    day: meeting.day,
                    startMins,
                    endMins,
                    timeRange: formatTime(meeting),
                });
            }

            // Check if this section conflicts with any other selected section
            const hasConflict = parsedMeetings.some((meeting) =>
                activeBlocks[meeting.day].some(
                    (block) =>
                        !(
                            block.courseId === courseId &&
                            getCategory(block.sectionNumber) === category
                        ) &&
                        meeting.startMins < block.endMins &&
                        meeting.endMins > block.startMins,
                ),
            );

            // Push each meeting as a ghost block
            for (const meeting of parsedMeetings) {
                grouped[meeting.day].push({
                    day: meeting.day,
                    endMins: meeting.endMins,
                    courseId,
                    startMins: meeting.startMins,
                    sectionId: section.id,
                    timeRange: meeting.timeRange,
                    hasConflict,
                    columnIndex: 0,
                    totalColumns: 1,
                    sectionNumber: section.sectionNumber,
                });
            }
        }

        return grouped;
    }, [days, dragState, activeBlocks, sectionsByCourseId, selectedTerm]);

    // ----- Action Handlers -----

    // Store block + pointer info on pointer down
    const handleDragStart = useCallback(
        (e: React.PointerEvent<HTMLDivElement>, block: Block) => {
            // Only primary button, and only one drag at a time
            if (e.button !== 0 || dragState || pendingDragRef.current) return;

            // Capture block and pointer info
            pendingDragRef.current = {
                block,
                pointerId: e.pointerId,
                startX: e.clientX,
                startY: e.clientY,
                blockElement: e.currentTarget,
            };
        },
        [dragState],
    );

    // Activate drag after 3px threshold, then track clone + hit-test ghosts
    const handleDragMove = useCallback(
        (e: React.PointerEvent<HTMLDivElement>) => {
            // 1. Check if pointer moved far enough to activate drag
            if (pendingDragRef.current) {
                // Calculate distance moved since pointer down
                const { startX, startY } = pendingDragRef.current;
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                if (dx * dx + dy * dy <= 9) return;

                // Grab the block's rect for clone sizing and initial position
                const { block, blockElement, pointerId } = pendingDragRef.current;
                const rect = blockElement.getBoundingClientRect();

                // Store pointer offset from block corner for smooth tracking
                setDragState({
                    block,
                    pointerId,
                    width: rect.width,
                    height: rect.height,
                    initialLeft: rect.left,
                    initialTop: rect.top,
                    offsetX: e.clientX - rect.left,
                    offsetY: e.clientY - rect.top,
                });

                // Clear the UI and lock the pointer
                onDragActivate();
                gridRef.current?.setPointerCapture(pointerId);
                pendingDragRef.current = null;
                return;
            }

            if (!dragState) return;

            // 2. Move the clone to follow the cursor
            if (cloneRef.current) {
                cloneRef.current.style.left = `${e.clientX - dragState.offsetX}px`;
                cloneRef.current.style.top = `${e.clientY - dragState.offsetY}px`;
            }

            // 3. Find which ghost the cursor is over
            const gridRect = gridRef.current?.getBoundingClientRect();
            if (!gridRect || !ghostData) return;

            // Figure out which day column the cursor is in
            const dayIndex = Math.floor(
                ((e.clientX - gridRect.left) / gridRect.width) * days.length,
            );
            const day = days[dayIndex];
            if (!day) {
                setHoveredGhostId(null);
                return;
            }

            // Convert cursor Y position to a time in minutes
            const cursorMinutes =
                ((e.clientY - gridRect.top) / gridRect.height) * TOTAL_MINS + START_TIME * 60;

            // Find the ghost at that day + time position
            const hoveredGhost = ghostData[day].find(
                (ghost) => cursorMinutes >= ghost.startMins && cursorMinutes <= ghost.endMins,
            );
            setHoveredGhostId(hoveredGhost?.sectionId ?? null);
        },
        [dragState, ghostData, days, START_TIME, TOTAL_MINS, onDragActivate],
    );

    // Stop right-click menu from opening during drag
    const handleContextMenu = useCallback(
        (e: React.MouseEvent) => {
            if (dragState) e.preventDefault();
        },
        [dragState],
    );

    // Complete or cancel the drag interaction
    const handleDragEnd = useCallback(() => {
        // If pointer released before threshold, treat it as a normal click
        if (pendingDragRef.current) {
            pendingDragRef.current = null;
            return;
        }

        if (!dragState) return;

        // Swap to the hovered ghost section
        if (hoveredGhostId !== null) {
            onSectionSwap(dragState.block.courseId, hoveredGhostId);
            setSwappedSectionId(hoveredGhostId);
        }

        // Reset drag state
        setDragState(null);
        setHoveredGhostId(null);
    }, [dragState, hoveredGhostId, onSectionSwap]);

    // ----- Effects -----

    // Reset any active drag when sections change or weekend toggles
    useEffect(() => {
        setDragState(null);
        setHoveredGhostId(null);
        pendingDragRef.current = null;
    }, [activeBlocks]);

    // Clear the swap animation flag after the fade-in
    useEffect(() => {
        if (swappedSectionId === null) return;
        const timer = setTimeout(() => setSwappedSectionId(null), 300);
        return () => clearTimeout(timer);
    }, [swappedSectionId]);

    // Position the clone where the block is on screen when drag starts
    useLayoutEffect(() => {
        if (!dragState || !cloneRef.current) return;
        cloneRef.current.style.left = `${dragState.initialLeft}px`;
        cloneRef.current.style.top = `${dragState.initialTop}px`;
    }, [dragState]);

    // ----- Export state, data, refs, and actions -----
    return {
        state: { dragState, hoveredGhostId, swappedSectionId },
        data: { ghostData },
        refs: { cloneRef },
        actions: { handleDragStart, handleDragMove, handleDragEnd, handleContextMenu },
    };
}
