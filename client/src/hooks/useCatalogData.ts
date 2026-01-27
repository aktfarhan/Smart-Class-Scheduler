import { useEffect, useState, useMemo } from 'react';
import { ACADEMIC_TERMS } from '../constants';
import type {
    ApiDepartmentWithRelations,
    ApiCourseWithDepartment,
    ApiSectionWithRelations,
    ApiCourseWithSections,
} from '../types';

export function useCatalogData() {
    const [departments, setDepartments] = useState<ApiDepartmentWithRelations[]>([]);
    const [courses, setCourses] = useState<ApiCourseWithSections[]>([]);
    const [sections, setSections] = useState<ApiSectionWithRelations[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [resD, resC, resS] = await Promise.all([
                    fetch('/api/departments'),
                    fetch('/api/courses'),
                    fetch('/api/sections'),
                ]);
                setDepartments(await resD.json());
                setCourses(await resC.json());
                setSections(await resS.json());
            } catch (e) {
                console.error('Catalog fetch failed', e);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    /**
     * Unified Lookup Maps for 0ms Search Parsing
     */
    const lookupData = useMemo(() => {
        const courseMap = new Map<string, ApiCourseWithDepartment>();
        const departmentMap = new Map<string, ApiDepartmentWithRelations>();
        const departmentTitleToCode = new Map<string, string>();
        const instructorSet = new Set<string>();

        // 1. Process Departments & Instructors
        departments.forEach((dept) => {
            const code = dept.code.toUpperCase();
            departmentMap.set(code, dept);
            departmentTitleToCode.set(dept.title.toLowerCase().trim(), code);

            // Populate instructor set from department relations
            dept.instructors?.forEach((inst) => {
                if (inst.firstName && inst.lastName) {
                    instructorSet.add(`${inst.firstName} ${inst.lastName}`.toLowerCase().trim());
                    instructorSet.add(inst.lastName.toLowerCase().trim());
                }
            });
        });

        // 2. Process Courses (Normalize "CS 110" -> "CS110")
        courses.forEach((course) => {
            const key = `${course.department.code}${course.code}`.toUpperCase().replace(/\s/g, '');
            courseMap.set(key, course);
        });

        return {
            courseMap,
            departmentMap,
            departmentTitleToCode,
            instructorSet,
        };
    }, [departments, courses]);

    /**
     * Optimized Section Grouping with Triple-Tier Sort:
     * 1. Year (Ascending)
     * 2. Semester (Spring -> Summer -> Fall -> Winter)
     * 3. Section Number (Natural Sort: 01, 02, 10)
     */
    const sectionsByCourseId = useMemo(() => {
        const courseSectionsMap = new Map<number, ApiSectionWithRelations[]>();

        const sortedSections = [...sections].sort((a, b) => {
            // Assume format "2025 Fall"
            const [yearA, semA] = a.term.split(' ');
            const [yearB, semB] = b.term.split(' ');

            // 1. Sort by Year
            if (yearA !== yearB) return parseInt(yearA) - parseInt(yearB);

            // 2. Sort by Semester Chronology
            if (semA !== semB) {
                return (ACADEMIC_TERMS.ORDER[semA] || 0) - (ACADEMIC_TERMS.ORDER[semB] || 0);
            }

            // 3. Sort by Section Number (Natural Sort handles "01" vs "10" correctly)
            return a.sectionNumber.localeCompare(b.sectionNumber, undefined, {
                numeric: true,
            });
        });

        sortedSections.forEach((section) => {
            if (!courseSectionsMap.has(section.courseId)) {
                courseSectionsMap.set(section.courseId, []);
            }
            courseSectionsMap.get(section.courseId)!.push(section);
        });

        return courseSectionsMap;
    }, [sections]);

    return {
        departments,
        courses,
        sections,
        sectionsByCourseId,
        lookupData,
        isLoading,
    };
}
