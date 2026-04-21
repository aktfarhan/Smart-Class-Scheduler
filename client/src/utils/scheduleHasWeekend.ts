import type { ApiSectionWithRelations } from '../types';

/**
 * Report whether any section in the schedule meets on Saturday or Sunday.
 *
 * @param sections - Sections to inspect.
 * @returns True when at least one meeting lands on Sa or Su.
 */
export function scheduleHasWeekend(sections: ApiSectionWithRelations[]): boolean {
    return sections.some((section) =>
        section.meetings.some((meeting) => meeting.day === 'Sa' || meeting.day === 'Su'),
    );
}
