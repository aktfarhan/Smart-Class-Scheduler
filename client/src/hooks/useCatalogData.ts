import { SEASON_ORDER } from '../constants';
import { useEffect, useState, useMemo } from 'react';
import { getAYForTerm, getTermsForAY } from '../utils/academicYear';
import type {
    ApiDepartmentWithRelations,
    ApiCourseWithDepartment,
    ApiSectionWithRelations,
    ApiCourseWithSections,
} from '../types';
const API_BASE = import.meta.env.VITE_API_URL ?? '';
const endpoint = (name: string) => (API_BASE ? `${API_BASE}/api/${name}` : `/data/${name}.json`);

export function useCatalogData() {
    const [departments, setDepartments] = useState<ApiDepartmentWithRelations[]>([]);
    const [courses, setCourses] = useState<ApiCourseWithSections[]>([]);
    const [sections, setSections] = useState<ApiSectionWithRelations[]>([]);
    const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [resD, resC, resS, resM] = await Promise.all([
                    fetch(endpoint('departments')),
                    fetch(endpoint('courses')),
                    fetch(endpoint('sections')),
                    fetch(endpoint('metadata')),
                ]);
                setDepartments(await resD.json());
                setCourses(await resC.json());
                setSections(await resS.json());
                setLastUpdatedAt((await resM.json())?.lastUpdatedAt ?? null);
            } catch (e) {
                console.error('Catalog fetch failed', e);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    // Pre-built lookup maps for fast filter validation.
    const lookupData = useMemo(() => {
        const courseMap = new Map<string, ApiCourseWithDepartment>();
        const departmentMap = new Map<string, ApiDepartmentWithRelations>();
        const departmentTitleToCode = new Map<string, string>();
        const instructorSet = new Set<string>();
        const academicYearsSet = new Set<number>();

        // 1. Process Departments & Instructors
        departments.forEach((department) => {
            const code = department.code.toUpperCase();
            departmentMap.set(code, department);
            departmentTitleToCode.set(department.title.toLowerCase().trim(), code);

            // Populate instructor set from department relations
            department.instructors.forEach((instructor) => {
                if (instructor.firstName && instructor.lastName) {
                    instructorSet.add(
                        `${instructor.firstName} ${instructor.lastName}`.toLowerCase().trim(),
                    );
                    instructorSet.add(instructor.lastName.toLowerCase().trim());
                }
            });
        });

        // 2. Process Courses (Normalize "CS 110" -> "CS110")
        courses.forEach((course) => {
            const key = `${course.department.code}${course.code}`.toUpperCase().replace(/\s/g, '');
            courseMap.set(key, course);
        });

        // 3. Derive academic years in the data
        for (const section of sections) {
            academicYearsSet.add(getAYForTerm(section.term));
        }
        const academicYears = [...academicYearsSet].sort((a, b) => a - b);

        // 4. Build the four terms per AY
        const termsSet = new Set(academicYears.flatMap(getTermsForAY));

        return {
            termsSet,
            courseMap,
            departmentMap,
            instructorSet,
            academicYears,
            departmentTitleToCode,
        };
    }, [departments, courses, sections]);

    /**
     * Optimized Section Grouping with Triple-Tier Sort:
     * 1. Year (Ascending)
     * 2. Semester (Fall -> Winter -> Spring -> Summer)
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
                return (SEASON_ORDER[semA] ?? 99) - (SEASON_ORDER[semB] ?? 99);
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
        lastUpdatedAt,
        isLoading,
    };
}
