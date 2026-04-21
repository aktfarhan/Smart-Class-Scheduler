import { meetingToMinutes } from '../utils/formatTime';
import { DATA_MAPS } from '../constants';
import type {
    Metric,
    SortOption,
    SortPriority,
    ScoredSchedule,
    RankedSchedule,
    ApiSectionWithRelations,
} from '../types';

// Predefined sort options
export const SORT_OPTIONS: SortOption[] = [
    {
        label: 'Compact',
        highlight: 'time',
        priorities: [
            { metric: 'activeDays', epsilon: 0, direction: 'asc' },
            { metric: 'totalTimeOnCampus', epsilon: 5, direction: 'asc' },
            { metric: 'totalGapMinutes', epsilon: 0, direction: 'asc' },
        ],
    },
    {
        label: 'Late Start',
        highlight: 'start',
        priorities: [
            { metric: 'earliestStart', epsilon: 15, direction: 'desc' },
            { metric: 'totalTimeOnCampus', epsilon: 5, direction: 'asc' },
            { metric: 'totalGapMinutes', epsilon: 0, direction: 'asc' },
        ],
    },
    {
        label: 'Early Finish',
        highlight: 'end',
        priorities: [
            { metric: 'latestEnd', epsilon: 15, direction: 'asc' },
            { metric: 'totalTimeOnCampus', epsilon: 5, direction: 'asc' },
            { metric: 'totalGapMinutes', epsilon: 0, direction: 'asc' },
        ],
    },
    {
        label: 'Day Off',
        highlight: 'days',
        priorities: [
            { metric: 'hasLongWeekend', epsilon: 0, direction: 'desc' },
            { metric: 'activeDays', epsilon: 0, direction: 'asc' },
            { metric: 'totalTimeOnCampus', epsilon: 5, direction: 'asc' },
        ],
    },
];

// ----- Phase 1: Score (runs once per generation) -----

/**
 * Score all DFS results on raw metrics.
 *
 * @param schedules - All valid section combinations from the DFS.
 * @returns Scored schedules with raw metrics attached.
 */
export function scoreAllSchedules(schedules: ApiSectionWithRelations[][]): ScoredSchedule[] {
    return schedules.map((sections) => {
        const sectionIds = new Set(sections.map((section) => section.id));

        // Group meetings by day with parsed minute values
        const dayMinutes = new Map<string, { start: number; end: number }[]>();

        for (const section of sections) {
            for (const meeting of section.meetings) {
                const { startMins, endMins } = meetingToMinutes(meeting);
                if (!dayMinutes.has(meeting.day)) dayMinutes.set(meeting.day, []);
                dayMinutes.get(meeting.day)!.push({ start: startMins, end: endMins });
            }
        }

        let earliestStart = Infinity;
        let latestEnd = 0;
        let totalTimeOnCampus = 0;
        let totalGapMinutes = 0;

        for (const meetings of dayMinutes.values()) {
            // Sort by start time so the walk picks up gaps linearly
            meetings.sort((a, b) => a.start - b.start);

            // Track global earliest/latest across all days
            earliestStart = Math.min(earliestStart, meetings[0].start);
            latestEnd = Math.max(latestEnd, meetings[meetings.length - 1].end);

            // Sum each day's span (first start to last end) for total time on campus
            totalTimeOnCampus += meetings[meetings.length - 1].end - meetings[0].start;

            // Sum idle minutes between consecutive meetings within this day
            for (let i = 1; i < meetings.length; i++) {
                totalGapMinutes += Math.max(0, meetings[i].start - meetings[i - 1].end);
            }
        }

        // Sort active days in calendar order for display
        const activeDayList = [...dayMinutes.keys()]
            .sort((a, b) => DATA_MAPS.DAY_RANK[a] - DATA_MAPS.DAY_RANK[b])
            .join('');

        // A long weekend requires either Monday or Friday to be free
        const hasLongWeekend = !dayMinutes.has('M') || !dayMinutes.has('F');

        return {
            sections,
            latestEnd,
            activeDays: dayMinutes.size,
            sectionIds,
            activeDayList,
            earliestStart,
            hasLongWeekend,
            totalGapMinutes,
            totalTimeOnCampus,
        };
    });
}

// ----- Phase 2: Filter + Rank (runs on sort change) -----

/**
 * Look up a metric's raw numeric value from a schedule.
 *
 * @param schedule - Schedule to query.
 * @param metric - Metric identifier.
 * @returns Raw numeric value for that metric.
 */
function readMetric(schedule: ScoredSchedule, metric: Metric): number {
    // hasLongWeekend is the only boolean metric, so map it to a numerical value
    if (metric === 'hasLongWeekend') return schedule.hasLongWeekend ? 1 : 0;
    return schedule[metric];
}

/**
 * Drop schedules dominated on every active-sort metric by another schedule.
 *
 * @param scored - Schedules to filter.
 * @param priorities - Active sort's priority chain.
 * @returns Non-dominated schedules only.
 */
function paretoFilter(scored: ScoredSchedule[], priorities: SortPriority[]): ScoredSchedule[] {
    // Pre-compute a normalized grid so lower means better
    const numericView = scored.map((schedule) =>
        priorities.map(({ metric, direction }) => {
            const raw = readMetric(schedule, metric);
            return direction === 'asc' ? raw : -raw;
        }),
    );

    const survivors: ScoredSchedule[] = [];

    // For each schedule, look for any other schedule that dominates it
    for (let i = 0; i < scored.length; i++) {
        let dominated = false;

        for (let j = 0; j < scored.length; j++) {
            if (i === j) continue;

            // j dominates i when j is at least as good on every metric AND strictly better on one
            let atLeastAsGood = true;
            let strictlyBetter = false;
            for (let metricIndex = 0; metricIndex < numericView[i].length; metricIndex++) {
                // j loses on this metric, so cannot dominate
                if (numericView[j][metricIndex] > numericView[i][metricIndex]) {
                    atLeastAsGood = false;
                    break;
                }
                // j wins strictly on this metric, so record the edge for the dominance check
                if (numericView[j][metricIndex] < numericView[i][metricIndex]) {
                    strictlyBetter = true;
                }
            }

            if (atLeastAsGood && strictlyBetter) {
                dominated = true;
                break;
            }
        }

        // Keep schedules that nothing dominates
        if (!dominated) survivors.push(scored[i]);
    }
    return survivors;
}

/**
 * Compare two schedules lexicographically against a chain of sort priorities.
 *
 * @param a - First schedule.
 * @param b - Second schedule.
 * @param priorities - Ordered priority chain from the active sort option.
 * @returns Negative if `a` ranks first, positive if `b` does, 0 if fully tied.
 */
function lexCompare(a: ScoredSchedule, b: ScoredSchedule, priorities: SortPriority[]): number {
    for (const priority of priorities) {
        const valueA = readMetric(a, priority.metric);
        const valueB = readMetric(b, priority.metric);
        const diff = priority.direction === 'asc' ? valueA - valueB : valueB - valueA;
        if (Math.abs(diff) > priority.epsilon) return diff;
    }
    return 0;
}

/**
 * Rank scored schedules using a lexicographic priority chain.
 *
 * @param scored - Pre-scored schedules from Phase 1.
 * @param option - Active sort option with its priority chain.
 * @returns Schedules ranked according to the option's priorities.
 */
export function rankBySortOption(scored: ScoredSchedule[], option: SortOption): RankedSchedule[] {
    if (scored.length === 0) return [];
    const survivors = paretoFilter(scored, option.priorities);
    return survivors.sort((a, b) => lexCompare(a, b, option.priorities));
}
