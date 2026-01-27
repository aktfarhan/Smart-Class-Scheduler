import clsx from 'clsx';
import { useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { CALENDAR_CONFIG } from '../../constants';
import { getInstructorNames } from '../../utils/formatInstructorNames';
import { formatTime, formatTimeToMinutes, formatHour } from '../../utils/formatTime';
import type { ApiSectionWithRelations, Block } from '../../types';

interface WeeklyCalendarProps {
    showWeekend: boolean;
    selectedSections: Set<number>; // Correctly typed as Set
    sectionsByCourseId: Map<number, ApiSectionWithRelations[]>;
}

function WeeklyCalendar({
    showWeekend,
    selectedSections,
    sectionsByCourseId,
}: WeeklyCalendarProps) {
    const { START_TIME, END_TIME, TOTAL_MINS, ALL_DAYS, WEEK_DAYS } = CALENDAR_CONFIG;
    const days = showWeekend ? ALL_DAYS : WEEK_DAYS;

    const activeBlocks = useMemo(() => {
        const grouped: Record<string, Block[]> = {};
        days.forEach((d) => (grouped[d] = []));
        const allBlocks: Block[] = [];

        // 1. Iterate through the Set of Section IDs
        selectedSections.forEach((sectionId) => {
            // 2. Find the section object by searching through the Map values
            let section: ApiSectionWithRelations | undefined;
            for (const courseSections of sectionsByCourseId.values()) {
                section = courseSections.find((s) => s.id === sectionId);
                if (section) break;
            }

            if (!section) return;

            // 3. Create blocks for each meeting
            section.meetings.forEach((meeting) => {
                const timeRange = formatTime(meeting);
                const minutes = formatTimeToMinutes(timeRange);
                if (!minutes) return;

                allBlocks.push({
                    day: meeting.day,
                    startMins: minutes.startMins,
                    endMins: minutes.endMins,
                    timeRange,
                    location: meeting.location,
                    sectionNumber: section!.sectionNumber,
                    instructors: getInstructorNames(section!.instructors),
                    courseCode: `${section!.course.department.code} ${section!.course.code}`,
                    hasConflict: false,
                });
            });
        });

        // 4. Determine conflicts
        allBlocks.forEach((block1, i) => {
            const hasConflict = allBlocks.some(
                (block2, j) =>
                    i !== j &&
                    block1.day === block2.day &&
                    block1.startMins < block2.endMins &&
                    block1.endMins > block2.startMins,
            );
            if (grouped[block1.day]) {
                grouped[block1.day].push({ ...block1, hasConflict });
            }
        });
        return grouped;
    }, [selectedSections, sectionsByCourseId, days]); // Added sectionsByCourseId to dependencies

    return (
        <div className="flex h-full w-full flex-col bg-white select-none">
            <div
                className={clsx(
                    'grid border-b border-gray-100 bg-white',
                    showWeekend ? 'grid-cols-7' : 'grid-cols-5',
                )}
            >
                {days.map((day) => (
                    <div
                        key={day}
                        className="border-r border-gray-50 py-4 text-center last:border-r-0"
                    >
                        <span className="text-[11px] font-black tracking-widest text-gray-400 uppercase">
                            {day}
                        </span>
                    </div>
                ))}
            </div>
            <div className="flex-1">
                <div className={clsx('grid h-full', showWeekend ? 'grid-cols-7' : 'grid-cols-5')}>
                    {days.map((day) => (
                        <div key={day} className="relative border-r border-gray-100">
                            {Array.from({ length: END_TIME - START_TIME }).map((_, i) => (
                                <div
                                    key={i}
                                    className="relative border-b border-gray-50"
                                    style={{
                                        height: `${100 / (END_TIME - START_TIME)}%`,
                                    }}
                                >
                                    <span className="absolute top-2 left-2 text-[9px] text-gray-400 uppercase">
                                        {formatHour(i + START_TIME)}
                                    </span>
                                </div>
                            ))}
                            {activeBlocks[day]?.map((block, i) => {
                                const top =
                                    ((block.startMins - START_TIME * 60) / TOTAL_MINS) * 100;
                                const height =
                                    ((block.endMins - block.startMins) / TOTAL_MINS) * 100;
                                return (
                                    <div
                                        key={i}
                                        style={{
                                            top: `${top}%`,
                                            height: `${height}%`,
                                        }}
                                        className={clsx(
                                            'absolute right-1.5 left-1.5 rounded-xl border-l-6 p-2 shadow-md transition-all',
                                            block.hasConflict
                                                ? 'animate-pulse border-red-500 bg-red-50 ring-2 shadow-red-100 ring-red-500'
                                                : 'border-theme-blue border-2 bg-gray-100',
                                        )}
                                    >
                                        <div className="flex h-full flex-col overflow-hidden">
                                            <div className="flex items-start justify-between">
                                                <span
                                                    className={clsx(
                                                        'text-[11px] font-bold uppercase',
                                                        block.hasConflict
                                                            ? 'text-red-600'
                                                            : 'text-theme-blue',
                                                    )}
                                                >
                                                    {block.courseCode}
                                                </span>
                                                {block.hasConflict && (
                                                    <AlertTriangle
                                                        size={12}
                                                        className="text-red-600"
                                                    />
                                                )}
                                            </div>
                                            <p className="truncate text-[10px]">
                                                Section {block.sectionNumber}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default WeeklyCalendar;
