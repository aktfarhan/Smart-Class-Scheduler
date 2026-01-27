import type { ApiCourseWithDepartment } from './api/course';
import type { ApiDepartmentWithRelations } from './api/department';
import type { AcademicTerm } from '../constants';
import type { Day } from './api/meeting';
import type { SectionType } from './api/section';

export * from './api/course';
export * from './api/section';
export * from './api/department';
export * from './api/instructor';
export * from './api/meeting';

export interface TimeRange {
    start: number;
    end: number;
}

export interface Block {
    day: string;
    endMins: number;
    location: string;
    timeRange: string;
    startMins: number;
    courseCode: string;
    instructors: string;
    hasConflict: boolean;
    sectionNumber: string;
}

export interface Token {
    type: FilterType;
    text: string;
    isRecognized: boolean;
}

export interface LookupData {
    courseMap: Map<string, ApiCourseWithDepartment>;
    instructorSet: Set<string>;
    departmentMap: Map<string, ApiDepartmentWithRelations>;
    departmentTitleToCode: Map<string, string>;
}

export type FilterType =
    | 'duration'
    | 'day'
    | 'timeRange'
    | 'departmentCode'
    | 'courseCode'
    | 'term'
    | 'sectionType'
    | 'clear'
    | 'unknown';

export interface SearchFilters {
    departmentCode?: string;
    courseCode?: string;
    text?: string;
    duration?: number;
    term?: AcademicTerm;
    days?: Day[];
    timeRange?: { start?: string; end?: string } | string;
    sectionType?: SectionType;
    instructorName?: string;
}

export type CourseSelection = number | number[];
