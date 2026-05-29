import type { Day } from './types';

/**
 * 1. UI & CALENDAR CONFIGURATION
 * Core settings for the schedule view, defining the vertical time-axis bounds
 * and standard day groupings for layout rendering.
 */
export const CALENDAR_CONFIG = {
    START_TIME: 8,
    END_TIME: 23,
    TOTAL_MINS: (23 - 8) * 60,
    ALL_DAYS: ['M', 'Tu', 'W', 'Th', 'F', 'Sa', 'Su'] as Day[],
    WEEK_DAYS: ['M', 'Tu', 'W', 'Th', 'F'] as Day[],
} as const;

/**
 * Pagination settings and logical constraints for schedule gap analysis.
 */
export const UI_LIMITS = {
    PRESETS: [10, 30, 60, 120],
    MAX_GAP: 300,
} as const;

/**
 * 2. ACADEMIC DATA
 * Seasonal sort order within an academic year.
 */
export const SEASON_ORDER: Record<string, number> = {
    Fall: 1,
    Winter: 2,
    Spring: 3,
    Summer: 4,
};

/**
 * 3. SEARCH & FILTER CATEGORIES
 * Validated lookup sets for the search parser and UI sidebar to ensure
 * incoming filter values match recognized database categories.
 */
export const FILTER_CATEGORIES = {
    DAYS: new Set(CALENDAR_CONFIG.ALL_DAYS),
    TYPES: new Set(['Lecture', 'Discussion']),
    TIMES: new Set(['Morning', 'Afternoon', 'Evening', 'Night']),
} as const;

/**
 * Maps technical keys used in code to high-level, human-readable labels for the UI.
 */
export const LABEL_MAP: Record<string, string> = {
    duration: 'DURATION',
    day: 'DAY',
    timeRange: 'TIMERANGE',
    departmentCode: 'DEPT',
    courseCode: 'COURSE',
    term: 'TERM',
    sectionType: 'TYPE',
    instructorName: 'PROF',
    unknown: 'NOT FOUND',
} as const;

/**
 * 4. DATA TRANSFORMATION MAPS
 * Lookup tables for standardizing variations in day formats, identifying
 * time-of-day segments, and providing sortable rankings for calendar days.
 */
export const DATA_MAPS = {
    // Normalizes shorthand or lowercase day inputs
    DAY_MAP: {
        m: 'M',
        tu: 'Tu',
        w: 'W',
        th: 'Th',
        f: 'F',
        sa: 'Sa',
        su: 'Su',
    } as Record<string, Day>,

    // Maps time-of-day keywords to specific clock-time boundaries
    PERIOD_MAP: {
        morning: { start: '8:00am', end: '11:59am' },
        afternoon: { start: '12:00pm', end: '4:59pm' },
        evening: { start: '5:00pm', end: '7:59pm' },
        night: { start: '8:00pm', end: '11:59pm' },
    } as Record<string, { start: string; end: string }>,

    // Provides a numerical index for sorting schedule items by day
    DAY_RANK: {
        M: 0,
        Tu: 1,
        W: 2,
        Th: 3,
        F: 4,
        Sa: 5,
        Su: 6,
    } as Record<string, number>,

    // Maps shorthand day codes to their full-length strings for display
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
 * Regular expressions and unit conversion scales used by the search engine
 * to interpret natural language strings and time ranges.
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
    // Captures numeric value and time unit (e.g., "90min" or "2hr")
    DURATION: /^(\d+)\s*(h|hr|hour|hours|m|min|mins|minutes)$/i,
    // Validates a string of concatenated day shorthand (e.g., "MTuW")
    DAYS_STRICT: /^(m|tu|w|th|f|sa|su)+$/i,
    // Identifies individual day segments within a concatenated string
    DAY_SEGMENTS: /m|tu|w|th|f|sa|su/gi,
    // Extracts name from instructor-focused searches
    INSTRUCTOR: /^(?:professor|prof\.?)\s+(?<name>.+)$/i,
    // Detects semester and year patterns (e.g., "Fall 2025" or "2025 Fall")
    TERM: /\b(fall|winter|spring|summer)\s*(\d{4})\b|\b(\d{4})\s*(fall|winter|spring|summer)\b/i,
    // Parses clock-time ranges (e.g., "10am - 12pm")
    TIME_RANGE:
        /\b((?:1[0-2]|0?[1-9])(?::[0-5]\d)?\s*[ap]m)\s*(?:-|to)\s*((?:1[0-2]|0?[1-9])(?::[0-5]\d)?\s*[ap]m)\b/i,
} as const;

/**
 * 6. CALENDAR BLOCK COLORS
 * Per-course color palette for calendar blocks. Cycles for 8+ courses.
 */
export const COURSE_COLORS = [
    {
        bg: 'bg-blue-50',
        miniBg: 'bg-blue-300',
        hoverBg: 'hover:bg-blue-100',
        border: 'border-blue-500/30',
        text: 'text-blue-700',
    },
    {
        bg: 'bg-purple-50',
        miniBg: 'bg-purple-300',
        hoverBg: 'hover:bg-purple-100',
        border: 'border-purple-500/30',
        text: 'text-purple-700',
    },
    {
        bg: 'bg-emerald-50',
        miniBg: 'bg-emerald-300',
        hoverBg: 'hover:bg-emerald-100',
        border: 'border-emerald-500/30',
        text: 'text-emerald-700',
    },
    {
        bg: 'bg-rose-50',
        miniBg: 'bg-rose-300',
        hoverBg: 'hover:bg-rose-100',
        border: 'border-rose-500/30',
        text: 'text-rose-700',
    },
    {
        bg: 'bg-amber-50',
        miniBg: 'bg-amber-300',
        hoverBg: 'hover:bg-amber-100',
        border: 'border-amber-500/30',
        text: 'text-amber-700',
    },
    {
        bg: 'bg-cyan-50',
        miniBg: 'bg-cyan-300',
        hoverBg: 'hover:bg-cyan-100',
        border: 'border-cyan-500/30',
        text: 'text-cyan-700',
    },
    {
        bg: 'bg-indigo-50',
        miniBg: 'bg-indigo-300',
        hoverBg: 'hover:bg-indigo-100',
        border: 'border-indigo-500/30',
        text: 'text-indigo-700',
    },
    {
        bg: 'bg-pink-50',
        miniBg: 'bg-pink-300',
        hoverBg: 'hover:bg-pink-100',
        border: 'border-pink-500/30',
        text: 'text-pink-700',
    },
] as const;
export type CourseColor = (typeof COURSE_COLORS)[number];

/**
 * 7. TYPE DEFINITIONS
 * Inferred TypeScript types derived from constant values to ensure
 * type-safety across the application.
 */
export type DayLiteral = (typeof CALENDAR_CONFIG.ALL_DAYS)[number];
