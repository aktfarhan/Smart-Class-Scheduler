import { z } from 'zod';

// Match mode enum for flexible filtering strategies
const matchModeEnum = z.enum(['strict', 'partial']);

// Schema for filtering instructors
export const instructorQuerySchema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    title: z.string().optional(),
    departments: z.string().optional(),
    sections: z.string().optional(),
});

// Schema for filtering departments, with optional code match mode
export const departmentQuerySchema = z.object({
    code: z.string().optional(),
    codeMatchMode: matchModeEnum.optional(),
    title: z.string().optional(),
});

// Schema for filtering courses, includes department filter
export const courseQuerySchema = z.object({
    code: z.string().optional(),
    codeMatchMode: matchModeEnum.optional(),
    title: z.string().optional(),
    department: z.string().optional(),
});

// Schema for filtering sections, including term, days, course, instructor, type, and async status
export const sectionQuerySchema = z.object({
    term: z.string().optional(),
    days: z.string().optional(),
    daysMatchMode: matchModeEnum.optional(),
    courseCode: z.string().optional(),
    courseCodeMatchMode: matchModeEnum.optional(),
    instructorName: z.string().optional(),
    type: z.string().optional(),
    isAsync: z.enum(['true', 'false']).optional(),
});
