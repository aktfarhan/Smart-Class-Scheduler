import type { ApiSectionWithRelations, TimeRange, Day } from './types';
import type { DayLiteral, AcademicTerm } from './constants';
import { formatTime, formatTimeToMinutes } from './utils/formatTime';

const decimalToMins = (hour: number) => Math.floor(hour * 60);

function isSectionCompatible(
    section: ApiSectionWithRelations,
    currentSchedule: ApiSectionWithRelations[],
    filters: {
        selectedDays: DayLiteral[];
        selectedTerm: AcademicTerm;
        minimumGap: number;
        timeRange: TimeRange;
    },
): boolean {
    if (section.term !== filters.selectedTerm) return false;

    for (const meeting of section.meetings) {
        const formattedRange = formatTime(meeting);
        // TBA sections are strictly compatible as they have no time constraints
        if (formattedRange === 'TBA') continue;

        const parsed = formatTimeToMinutes(formattedRange);
        if (!parsed) continue;

        const { startMins, endMins } = parsed;

        if (meeting.day && !filters.selectedDays.includes(meeting.day as any)) return false;

        if (
            startMins < decimalToMins(filters.timeRange.start) ||
            endMins > decimalToMins(filters.timeRange.end)
        )
            return false;

        for (const scheduledSection of currentSchedule) {
            for (const sMeeting of scheduledSection.meetings) {
                const sRange = formatTime(sMeeting);
                if (sRange === 'TBA' || meeting.day !== sMeeting.day) continue;

                const sParsed = formatTimeToMinutes(sRange);
                if (sParsed) {
                    const { startMins: sStart, endMins: sEnd } = sParsed;

                    // Strict Overlap Check
                    if (startMins < sEnd && endMins > sStart) return false;

                    // Strict Minimum Gap Check
                    const gap = startMins >= sEnd ? startMins - sEnd : sStart - endMins;
                    if (gap < filters.minimumGap) return false;
                }
            }
        }
    }
    return true;
}

export function generateSchedulesDFS(
    courses: { id: number; sections: ApiSectionWithRelations[] }[],
    filters: {
        selectedDays: DayLiteral[];
        selectedTerm: AcademicTerm;
        minimumGap: number;
        timeRange: TimeRange;
    },
    index: number = 0,
    currentSchedule: ApiSectionWithRelations[] = [],
): ApiSectionWithRelations[][] {
    if (index === courses.length) return [currentSchedule];

    const results: ApiSectionWithRelations[][] = [];
    const currentCourse = courses[index];

    // CRITICAL FIX: Strictly filter out any sections that have 0 meetings.
    // If a section is asynchronous but has no meeting data, it cannot be scheduled.
    const termSections = currentCourse.sections.filter(
        (s) => s.term === filters.selectedTerm && s.meetings.length > 0,
    );

    const labs = termSections.filter((s) => s.sectionNumber.endsWith('L'));
    const discs = termSections.filter((s) => s.sectionNumber.endsWith('D'));
    const lecs = termSections.filter(
        (s) => !s.sectionNumber.endsWith('D') && !s.sectionNumber.endsWith('L'),
    );

    if (labs.length > 0 || discs.length > 0) {
        for (const lecture of lecs) {
            if (!isSectionCompatible(lecture, currentSchedule, filters)) continue;

            const labsToTry = labs.length > 0 ? labs : [null];
            const discsToTry = discs.length > 0 ? discs : [null];

            for (const lab of labsToTry) {
                if (lab && !isSectionCompatible(lab, [...currentSchedule, lecture], filters))
                    continue;

                for (const disc of discsToTry) {
                    const validationSet = [...currentSchedule, lecture];
                    if (lab) validationSet.push(lab);
                    if (disc && !isSectionCompatible(disc, validationSet, filters)) continue;

                    const combo = [lecture];
                    if (lab) combo.push(lab);
                    if (disc) combo.push(disc);

                    const subResults = generateSchedulesDFS(courses, filters, index + 1, [
                        ...currentSchedule,
                        ...combo,
                    ]);
                    if (subResults.length > 0) results.push(...subResults);
                }
            }
        }
    } else {
        for (const section of termSections) {
            if (isSectionCompatible(section, currentSchedule, filters)) {
                const subResults = generateSchedulesDFS(courses, filters, index + 1, [
                    ...currentSchedule,
                    section,
                ]);
                if (subResults.length > 0) results.push(...subResults);
            }
        }
    }
    return results;
}
