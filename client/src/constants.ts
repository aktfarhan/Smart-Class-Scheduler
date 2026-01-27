import type { Day } from './types';

/**
 * 1. UI & CALENDAR CONFIGURATION
 * Constants that define the limits and layout of the application.
 */
export const CALENDAR_CONFIG = {
    START_TIME: 8,
    END_TIME: 23,
    TOTAL_MINS: (23 - 8) * 60,
    ALL_DAYS: ['M', 'Tu', 'W', 'Th', 'F', 'Sa', 'Su'] as Day[],
    WEEK_DAYS: ['M', 'Tu', 'W', 'Th', 'F'] as Day[],
} as const;

export const UI_LIMITS = {
    PAGE_SIZE: 50,
    PRESETS: [0, 15, 60, 120],
    MAX_GAP: 300,
} as const;

/**
 * 2. ACADEMIC DATA
 * Definitions for terms and their chronological sorting order.
 */
export const ACADEMIC_TERMS = {
    ORDER: {
        Fall: 1,
        Winter: 2,
        Spring: 3,
        Summer: 4,
    } as Record<string, number>,
    TERMS: ['2025 Fall', '2026 Winter', '2026 Spring', '2026 Summer'],
} as const;

/**
 * 3. SEARCH & FILTER CATEGORIES
 * Sets and Maps used specifically for the search parser and sidebar filters.
 */
export const FILTER_CATEGORIES = {
    DAYS: new Set(CALENDAR_CONFIG.ALL_DAYS),
    TERMS: new Set(ACADEMIC_TERMS.TERMS),
    TYPES: new Set(['Lecture', 'Discussion']),
    TIMES: new Set(['Morning', 'Afternoon', 'Evening', 'Night']),
} as const;

export const LABEL_MAP: Record<string, string> = {
    duration: 'DURATION',
    day: 'DAY',
    timeRange: 'TIMERANGE',
    departmentCode: 'DEPT',
    courseCode: 'COURSE',
    term: 'TERM',
    sectionType: 'TYPE',
    unknown: 'NOT FOUND',
} as const;

/**
 * 4. DATA TRANSFORMATION MAPS
 * Used for converting raw input or database values into readable formats.
 */
export const DATA_MAPS = {
    DAY_MAP: {
        m: 'M',
        tu: 'Tu',
        w: 'W',
        th: 'Th',
        f: 'F',
        sa: 'Sa',
        su: 'Su',
    } as Record<string, Day>,

    PERIOD_MAP: {
        morning: { start: '8:00am', end: '11:59am' },
        afternoon: { start: '12:00pm', end: '4:59pm' },
        evening: { start: '5:00pm', end: '7:59pm' },
        night: { start: '8:00pm', end: '11:59pm' },
    } as Record<string, { start: string; end: string }>,

    DAY_RANK: {
        M: 0,
        Tu: 1,
        W: 2,
        Th: 3,
        F: 4,
        Sa: 5,
        Su: 6,
    } as Record<string, number>,

    FULL_DAY_MAP: {
        M: 'Monday',
        Tu: 'Tuesday',
        W: 'Wednesday',
        Th: 'Thursday',
        F: 'Friday',
        Sa: 'Saturday',
        Su: 'Sunday',
    } as Record<string, string>,
} as const;

/**
 * 5. PARSER LOGIC
 * Regular expressions and unit mappings for natural language processing.
 */
export const DURATION_UNITS = new Map<string, number>([
    ['h', 60],
    ['hr', 60],
    ['hour', 60],
    ['hours', 60],
    ['m', 1],
    ['min', 1],
    ['mins', 1],
    ['minutes', 1],
]);

export const REGEX = {
    DURATION: /^(\d+)\s*(h|hr|hour|hours|m|min|mins|minutes)$/i,
    DAYS_STRICT: /^(m|tu|w|th|f|sa|su)+$/i,
    DAY_SEGMENTS: /m|tu|w|th|f|sa|su/gi,
    TIME_RANGE:
        /\b((?:1[0-2]|0?[1-9])(?::[0-5]\d)?\s*[ap]m)\s*(?:-|to)\s*((?:1[0-2]|0?[1-9])(?::[0-5]\d)?\s*[ap]m)\b/i,
    TERM: /\b(fall|winter|spring|summer)\s*(\d{4})\b|\b(\d{4})\s*(fall|winter|spring|summer)\b/i,
} as const;

/**
 * 6. TYPE DEFINITIONS
 */
export type DayLiteral = (typeof CALENDAR_CONFIG.ALL_DAYS)[number];
export type AcademicTerm = (typeof ACADEMIC_TERMS.TERMS)[number];
