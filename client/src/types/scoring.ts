import type { ApiSectionWithRelations } from './api/section';

/**
 * Types used by the scoring engine to rank generated schedules.
 */

// Metrics available for ranking
export type Metric =
    | 'latestEnd'
    | 'activeDays'
    | 'earliestStart'
    | 'hasLongWeekend'
    | 'totalGapMinutes'
    | 'totalTimeOnCampus';

// A single rung in the lexicographic sort chain
export interface SortPriority {
    metric: Metric;
    epsilon: number;
    direction: 'asc' | 'desc';
}

// Raw metrics from a single schedule
export interface ScoredSchedule {
    sections: ApiSectionWithRelations[];
    latestEnd: number;
    activeDays: number;
    sectionIds: Set<number>;
    activeDayList: string;
    earliestStart: number;
    hasLongWeekend: boolean;
    totalGapMinutes: number;
    totalTimeOnCampus: number;
}

// Alias kept so downstream components don't churn if ranking adds fields later
export type RankedSchedule = ScoredSchedule;

// Identifies which stat segment to emphasize in the card for a given preset
export type SortHighlight = 'days' | 'end' | 'start' | 'time';

// Sort option label + priority chain + stat to highlight
export interface SortOption {
    label: string;
    highlight: SortHighlight;
    priorities: SortPriority[];
}
