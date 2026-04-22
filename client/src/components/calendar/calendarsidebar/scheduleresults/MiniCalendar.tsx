import React from 'react';
import { CALENDAR_CONFIG } from '../../../../constants';
import { meetingToMinutes } from '../../../../utils/formatTime';
import type { ApiSectionWithRelations } from '../../../../types';

interface MiniCalendarProps {
    sections: ApiSectionWithRelations[];
    showWeekend: boolean;
    courseColorMap: Map<string, string>;
}

const START = CALENDAR_CONFIG.START_TIME * 60;
const TOTAL = CALENDAR_CONFIG.TOTAL_MINS;

function MiniCalendar({ sections, showWeekend, courseColorMap }: MiniCalendarProps) {
    // Pick the appropriate days for mini calendar
    const days = showWeekend ? CALENDAR_CONFIG.ALL_DAYS : CALENDAR_CONFIG.WEEK_DAYS;

    // Build buckets grouped by day
    const dayBlocks: Record<string, { top: number; height: number; fill: string }[]> = {};
    for (const day of days) dayBlocks[day] = [];

    // For each section, convert its meetings to positioned blocks in their day's bucket
    for (const section of sections) {
        // Look up the shared fill color for this section's course
        const courseCode = `${section.course.department.code} ${section.course.code}`;
        const fill = courseColorMap.get(courseCode)!;

        for (const meeting of section.meetings) {
            // Skip any day not in the active column set
            if (!dayBlocks[meeting.day]) continue;

            // Convert meeting times to percentage offsets
            const { startMins, endMins } = meetingToMinutes(meeting);
            const top = ((startMins - START) / TOTAL) * 100;
            const height = ((endMins - startMins) / TOTAL) * 100;
            dayBlocks[meeting.day].push({ top, height, fill });
        }
    }

    return (
        <div className="flex h-14 w-full gap-px overflow-hidden rounded-md bg-slate-100">
            {days.map((day) => (
                <div key={day} className="relative flex-1 bg-white">
                    {dayBlocks[day].map((block, index) => (
                        <div
                            key={index}
                            className={`absolute inset-x-0.5 rounded-sm ${block.fill}`}
                            style={{
                                top: `${block.top}%`,
                                height: `${Math.max(block.height, 4)}%`,
                            }}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}

export default React.memo(MiniCalendar);
