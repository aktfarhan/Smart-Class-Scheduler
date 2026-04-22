import clsx from 'clsx';
import GhostBlock from './GhostBlock';
import BlockPopover from './BlockPopover';
import CalendarBlock from './CalendarBlock';
import { formatHour } from '../../utils/formatTime';
import { useWeeklyCalendar } from './useWeeklyCalendar';
import type { ApiSectionWithRelations } from '../../types';
import { CALENDAR_CONFIG, type AcademicTerm } from '../../constants';

interface WeeklyCalendarProps {
    showWeekend: boolean;
    selectedTerm: AcademicTerm;
    selectedSections: Set<number>;
    sectionsByCourseId: Map<number, ApiSectionWithRelations[]>;
    onSectionSwap: (courseId: number, sectionId: number) => void;
}

function WeeklyCalendar({
    showWeekend,
    selectedTerm,
    selectedSections,
    sectionsByCourseId,
    onSectionSwap,
}: WeeklyCalendarProps) {
    const { START_TIME, END_TIME, TOTAL_MINS } = CALENDAR_CONFIG;
    const { state, data, refs, actions } = useWeeklyCalendar({
        showWeekend,
        selectedTerm,
        selectedSections,
        sectionsByCourseId,
        onSectionSwap,
    });

    // Get the dragged block's course color for the clone and ghost blocks
    const courseColor = state.dragState
        ? data.courseColorMap.get(state.dragState.block.courseCode)!
        : null;

    return (
        <div className="flex h-full w-full flex-col bg-white select-none">
            <div
                className={clsx(
                    'grid border-b border-gray-100 bg-white',
                    showWeekend ? 'grid-cols-7' : 'grid-cols-5',
                )}
            >
                {data.days.map((day) => (
                    <div
                        key={day}
                        className="border-r border-gray-100 bg-gray-50/50 py-4 text-center last:border-r-0"
                    >
                        <span className="text-[11px] font-black tracking-widest text-slate-500 uppercase">
                            {day}
                        </span>
                    </div>
                ))}
            </div>
            <div className="flex-1">
                <div
                    ref={refs.gridRef}
                    className={clsx(
                        'relative grid h-full',
                        showWeekend ? 'grid-cols-7' : 'grid-cols-5',
                        state.dragState && 'cursor-grabbing touch-none',
                    )}
                    onClick={actions.handlePopoverClose}
                    onPointerMove={actions.handleDragMove}
                    onPointerUp={actions.handleDragEnd}
                    onPointerCancel={actions.handleDragEnd}
                    onContextMenu={actions.handleContextMenu}
                >
                    {data.days.map((day, dayIndex) => (
                        <div
                            key={day}
                            className={clsx(
                                'relative border-r border-gray-100',
                                dayIndex % 2 === 1 && 'bg-gray-50/60',
                            )}
                        >
                            {Array.from({ length: END_TIME - START_TIME + 1 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="relative border-b border-gray-100/60"
                                    style={{
                                        height: `${100 / (END_TIME - START_TIME + 1)}%`,
                                    }}
                                >
                                    <span className="absolute top-2 left-2 text-[9px] text-slate-400 uppercase">
                                        {formatHour(i + START_TIME)}
                                    </span>
                                </div>
                            ))}
                            <div
                                className={clsx(
                                    'absolute inset-0 transition-opacity duration-150',
                                    state.dragState && 'pointer-events-none opacity-40',
                                )}
                            >
                                {(data.previewBlocks?.[day]?.blocks ?? data.activeBlocks[day]).map(
                                    (block) => {
                                    const top =
                                        ((block.startMins - START_TIME * 60) / TOTAL_MINS) * 100;
                                    const height =
                                        ((block.endMins - block.startMins) / TOTAL_MINS) * 100;
                                    return (
                                        <CalendarBlock
                                            key={`${block.sectionId}-${block.startMins}`}
                                            top={top}
                                            block={block}
                                            color={data.courseColorMap.get(block.courseCode)!}
                                            height={height}
                                            isWide={state.isWide}
                                            totalMins={TOTAL_MINS}
                                            gridHeight={refs.gridRef.current?.clientHeight ?? 0}
                                            onClick={actions.handleBlockClick}
                                            onPointerDown={actions.handleDragStart}
                                        />
                                    );
                                })}
                            </div>
                            {state.dragState &&
                                data.previewBlocks?.[day]?.ghosts.map((ghost) => {
                                const top =
                                    ((ghost.startMins - START_TIME * 60) / TOTAL_MINS) * 100;
                                const height =
                                    ((ghost.endMins - ghost.startMins) / TOTAL_MINS) * 100;
                                return (
                                    <GhostBlock
                                        key={`ghost-${ghost.sectionId}-${ghost.startMins}`}
                                        top={top}
                                        color={courseColor!}
                                        height={height}
                                        timeRange={ghost.timeRange}
                                        isHovered={state.hoveredGhostId === ghost.sectionId}
                                        columnIndex={ghost.columnIndex}
                                        hasConflict={ghost.hasConflict}
                                        totalColumns={ghost.totalColumns}
                                        sectionNumber={ghost.sectionNumber}
                                    />
                                );
                            })}
                        </div>
                    ))}
                    {state.popover &&
                        data.popoverPosition &&
                        data.courseColorMap.has(state.popover.courseCode) && (
                            <BlockPopover
                                block={state.popover}
                                color={data.courseColorMap.get(state.popover.courseCode)!}
                                position={data.popoverPosition}
                                onClose={actions.handlePopoverClose}
                            />
                        )}
                </div>
            </div>
            {state.dragState && courseColor && (
                <div
                    ref={refs.cloneRef}
                    className={clsx(
                        'pointer-events-none fixed z-50 scale-105 overflow-hidden rounded-xl border-2 border-l-6 p-2.5 shadow-2xl',
                        courseColor.border,
                        courseColor.bg,
                    )}
                    style={{
                        width: state.dragState.width,
                        height: state.dragState.height,
                    }}
                >
                    <p className={clsx('truncate text-[11px] font-bold', courseColor.text)}>
                        {state.dragState.block.courseCode}
                    </p>
                    <p className="truncate text-[10px] font-medium text-gray-600">
                        {state.dragState.block.sectionNumber} · {state.dragState.block.timeRange}
                    </p>
                </div>
            )}
        </div>
    );
}

export default WeeklyCalendar;
