import { DATA_MAPS } from '../constants';
import { getCategory } from '../utils/getCategory';
import { meetingToMinutes } from '../utils/formatTime';
import type { DayLiteral } from '../constants';
import type {
    ApiSectionWithRelations,
    TimeRange,
    AcademicTerm,
    ScheduleResult,
    CourseDiagnostic,
    DiagnosticReason,
} from '../types';

// Pre-calculated meeting times to avoid string parsing
interface ParsedMeeting {
    day: DayLiteral;
    start: number;
    end: number;
}

// Extend the base section type to include pre-parsed numeric times
type ParsedSection = ApiSectionWithRelations & {
    parsedMeetings: ParsedMeeting[];
};

/**
 * Check if a section fits into the current schedule without time conflicts or gap violations.
 *
 * @param section - The section being tested.
 * @param currentSchedule - The sections already placed in the "current branch" of the search.
 * @param minGap - Required buffer time between classes in minutes.
 */
function isSectionCompatible(
    section: ParsedSection,
    currentSchedule: ParsedSection[],
    minGap: number,
): boolean {
    // Loop through every meeting of the NEW section
    for (const meeting of section.parsedMeetings) {
        // Compare this meeting against already selected meetings
        for (const scheduledSection of currentSchedule) {
            for (const scheduledMeeting of scheduledSection.parsedMeetings) {
                // If the classes are on different days, they can't conflict
                if (meeting.day !== scheduledMeeting.day) continue;

                // Check if there is a time conflict between meetings
                if (meeting.start < scheduledMeeting.end && meeting.end > scheduledMeeting.start)
                    return false;

                // Find the distance between the end of the earlier class and the start of the next one
                const gap =
                    meeting.start >= scheduledMeeting.end
                        ? meeting.start - scheduledMeeting.end
                        : scheduledMeeting.start - meeting.end;

                // If the gap is smaller than the user's preference, it's a conflict.
                if (gap < minGap) return false;
            }
        }
    }
    return true;
}

/**
 * Build a diagnostic for a course that failed filtering, with suggestion data for the UI.
 *
 * @param reason - The filter stage that eliminated all sections.
 * @param courseId - The course ID for keying in the UI.
 * @param courseCode - Display label like "CS 240".
 * @param parsedSections - Sections that passed the term filter.
 * @param afterDaysSections - Sections that passed the day filter.
 */
function buildDiagnostic(
    reason: DiagnosticReason,
    courseId: number,
    courseCode: string,
    parsedSections: ParsedSection[],
    afterDaysSections: ParsedSection[],
): CourseDiagnostic {
    // Collect available days from sections that passed term but failed days
    let availableDays: DayLiteral[] = [];
    if (reason === 'noDays') {
        const daySet = new Set<DayLiteral>();
        for (const section of parsedSections) {
            for (const meeting of section.parsedMeetings) {
                daySet.add(meeting.day);
            }
        }
        // Deduplicate and sort in calendar order for display
        availableDays = [...daySet].sort((a, b) => DATA_MAPS.DAY_RANK[a] - DATA_MAPS.DAY_RANK[b]);
    }

    // Find the time bounds of sections that passed days but failed the time range
    let earliestStart: number | null = null;
    let latestEnd: number | null = null;
    if (reason === 'noTime') {
        for (const section of afterDaysSections) {
            for (const meeting of section.parsedMeetings) {
                // Track the global min start and max end across all meetings
                if (earliestStart === null || meeting.start < earliestStart) {
                    earliestStart = meeting.start;
                }
                if (latestEnd === null || meeting.end > latestEnd) {
                    latestEnd = meeting.end;
                }
            }
        }
    }

    return {
        reason,
        courseId,
        latestEnd,
        courseCode,
        availableDays,
        earliestStart,
    };
}

/**
 * Generates all valid class schedules using a Depth-First Search (Backtracking) algorithm.
 *
 * @param courses - The list of courses the student wants to take.
 * @param filters - The user's preferences for days, times, and gaps.
 * @returns Schedules on success, diagnostics on failure.
 */
export function generateSchedulesDFS(
    courses: { id: number; sections: ApiSectionWithRelations[]; courseCode: string }[],
    filters: {
        timeRange: TimeRange;
        minimumGap: number;
        selectedDays: DayLiteral[];
        selectedTerm: AcademicTerm;
    },
): ScheduleResult {
    const { timeRange, minimumGap, selectedDays, selectedTerm } = filters;

    // Convert global time to minutes after midnight
    const startLimit = timeRange.start * 60;
    const endLimit = timeRange.end * 60;

    // Pre-process and filter courses to collect diagnostics
    const diagnostics: CourseDiagnostic[] = [];

    const processedCourses = courses.map((course) => {
        // 1. Filter by term and presence of meeting data
        const afterTermSections = course.sections.filter(
            (section) => section.term === selectedTerm && section.meetings.length > 0,
        );

        // 2. Parse meetings to numeric minutes
        const parsedSections = afterTermSections.map((section) => ({
            ...section,
            parsedMeetings: section.meetings.map((meeting) => {
                const { startMins, endMins } = meetingToMinutes(meeting);
                return { day: meeting.day, start: startMins, end: endMins };
            }),
        }));

        // 3. Filter by selected days
        const afterDaysSections = parsedSections.filter((section) =>
            section.parsedMeetings.every((meeting) => selectedDays.includes(meeting.day)),
        );

        // 4. Filter by time range
        const afterTimeSections = afterDaysSections.filter((section) =>
            section.parsedMeetings.every(
                (meeting) => meeting.start >= startLimit && meeting.end <= endLimit,
            ),
        );

        // Find the first filter stage that eliminated all sections
        let reason: DiagnosticReason = 'ok';
        if (afterTermSections.length === 0) {
            reason = 'noTerm';
        } else if (afterDaysSections.length === 0) {
            reason = 'noDays';
        } else if (afterTimeSections.length === 0) {
            reason = 'noTime';
        }

        diagnostics.push(
            buildDiagnostic(
                reason,
                course.id,
                course.courseCode,
                parsedSections,
                afterDaysSections,
            ),
        );

        return { ...course, sections: afterTimeSections };
    });

    // Early exit — skip backtracking when any course has zero viable sections
    if (diagnostics.some((diagnostic) => diagnostic.reason !== 'ok')) {
        return { schedules: [], diagnostics };
    }

    // Precompute section groupings once per course
    const courseGroups = processedCourses.map((course) => {
        const lectures = course.sections.filter(
            (section) => getCategory(section.sectionNumber) === 'LEC',
        );
        const secondaries = course.sections.filter(
            (section) => getCategory(section.sectionNumber) !== 'LEC',
        );
        return { lectures, secondaries };
    });

    const allResults: ApiSectionWithRelations[][] = [];
    const currentPath: ParsedSection[] = [];

    // Recursive function that explores course combinations
    function backtrack(courseIdx: number) {
        // Base case: save result if a section was picked for every course
        if (courseIdx === courseGroups.length) {
            allResults.push([...currentPath]);
            return;
        }

        const { lectures, secondaries } = courseGroups[courseIdx];

        if (secondaries.length > 0) {
            // Case when course requires a lecture paired with one secondary section
            for (const lecture of lectures) {
                // Check lecture compatibility in the schedule
                if (!isSectionCompatible(lecture, currentPath, minimumGap)) continue;

                // Temporarily add lecture to the schedule path
                currentPath.push(lecture);

                for (const secondary of secondaries) {
                    // Check secondary compatibility with the lecture and schedule
                    if (!isSectionCompatible(secondary, currentPath, minimumGap)) continue;

                    // Add secondary and move to the next course in the list
                    currentPath.push(secondary);
                    backtrack(courseIdx + 1);

                    // Remove secondary to try the next combination
                    currentPath.pop();
                }

                // Remove lecture to try the next lecture combination
                currentPath.pop();
            }
        } else {
            // Case for standard courses with only one section component
            for (const section of lectures) {
                // Check compatibility before adding the section
                if (isSectionCompatible(section, currentPath, minimumGap)) {
                    currentPath.push(section);
                    backtrack(courseIdx + 1);

                    // Backtrack by removing the section
                    currentPath.pop();
                }
            }
        }
    }

    // Start the search at the first course index
    backtrack(0);

    // Mark all courses as conflicting when DFS exhausted every combination
    if (allResults.length === 0) {
        for (const diagnostic of diagnostics) diagnostic.reason = 'conflict';
        return { schedules: [], diagnostics };
    }

    return { schedules: allResults, diagnostics: null };
}
