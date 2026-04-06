import type { Day } from './api/meeting';
import type { AcademicTerm } from '../constants';
import type { ApiCourseWithDepartment } from './api/course';
import type { ApiDepartmentWithRelations } from './api/department';
import type { SectionType, ApiSectionWithRelations } from './api/section';

/**
 * Aggregates all database-related types from the API sub-directory
 * to provide a single entry point for data models.
 */
export * from './api/course';
export * from './api/section';
export * from './api/department';
export * from './api/instructor';
export * from './api/meeting';

// Pipeline metadata from /api/metadata
export interface ApiMetadata {
    id: number;
    lastUpdatedAt: string;
}

/**
 * Types used to manage the visual representation of data in the
 * schedule and calendar components.
 */
export interface TimeRange {
    start: number;
    end: number;
}

// Represents a single block on the calendar grid
export interface Block {
    courseId: number;
    courseCode: string;
    sectionId: number;
    sectionNumber: string;
    day: Day;
    startMins: number;
    endMins: number;
    timeRange: string;
    instructors: string;
    location: string;
    columnIndex: number;
    totalColumns: number;
    hasConflict: boolean;
}

// Stores pointer-down info before drag threshold is met
export interface PendingDrag {
    block: Block;
    pointerId: number;
    startX: number;
    startY: number;
    blockElement: HTMLElement;
}

// Tracks the actively dragged calendar block during drag-to-swap
export interface DragState {
    block: Block;
    pointerId: number;
    width: number;
    height: number;
    initialLeft: number;
    initialTop: number;
    offsetX: number;
    offsetY: number;
}

// Represents an alternative section drop target during drag-to-swap
export interface GhostBlockData {
    day: Day;
    endMins: number;
    courseId: number;
    startMins: number;
    sectionId: number;
    timeRange: string;
    hasConflict: boolean;
    columnIndex: number;
    totalColumns: number;
    sectionNumber: string;
}

/**
 * Types used by the schedule generator to diagnose why
 * no valid schedules could be produced.
 */
export type DiagnosticReason = 'ok' | 'noTerm' | 'noDays' | 'noTime' | 'conflict';

// Per-course breakdown of which filter stage eliminated all sections
export interface CourseDiagnostic {
    reason: DiagnosticReason;
    courseId: number;
    latestEnd: number | null;
    courseCode: string;
    availableDays: Day[];
    earliestStart: number | null;
}

// Return type of the DFS scheduler — schedules on success, diagnostics on failure
export interface ScheduleResult {
    schedules: ApiSectionWithRelations[][];
    diagnostics: CourseDiagnostic[] | null;
}

/**
 * Types used by the search engine to tokenize and categorize
 * user input during natural language processing.
 */
export type FilterType =
    | 'duration'
    | 'day'
    | 'timeRange'
    | 'departmentCode'
    | 'courseCode'
    | 'term'
    | 'sectionType'
    | 'instructorName'
    | 'clear'
    | 'unknown';

// Represents an individual parsed segment of a search query
export interface Token {
    type: FilterType;
    text: string;
    isRecognized: boolean;
}

/**
 * Objects used to track active search criteria and cache
 * database values for fast client-side lookups.
 */
export interface SearchFilters {
    departmentCode?: string;
    courseCode?: string;
    text?: string;
    duration?: number;
    term?: AcademicTerm;
    days?: Day[];
    timeRange?: { start: string; end: string };
    sectionType?: SectionType;
    instructorName?: string;
}

// In-memory data structures used to speed up search comparisons
export interface LookupData {
    courseMap: Map<string, ApiCourseWithDepartment>;
    instructorSet: Set<string>;
    departmentMap: Map<string, ApiDepartmentWithRelations>;
    departmentTitleToCode: Map<string, string>;
}
