import CourseCard from './CourseCard';
import { useCallback, useMemo } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { AcademicTerm } from '../../../../constants';
import type { ApiCourseWithSections } from '../../../../types';
import type { ApiSectionWithRelations } from '../../../../types';

interface CourseListProps {
    expandedId: number | null;
    selectedTerm: AcademicTerm;
    selectedSections: Set<number>;
    pinnedCourses: ApiCourseWithSections[];
    sectionsByCourseId: Map<number, ApiSectionWithRelations[]>;
    setExpandedId: Dispatch<SetStateAction<number | null>>;
    onSectionSelect: (courseId: number, sectionId: number) => void;
}

function CourseList({
    expandedId,
    selectedTerm,
    selectedSections,
    pinnedCourses,
    sectionsByCourseId,
    setExpandedId,
    onSectionSelect,
}: CourseListProps) {
    const handleExpand = useCallback(
        (courseId: number) => {
            setExpandedId((prev) => (prev === courseId ? null : courseId));
        },
        [setExpandedId],
    );

    const filteredSectionsMap = useMemo(() => {
        const map = new Map<number, ApiSectionWithRelations[]>();
        pinnedCourses.forEach((course) => {
            const sections = sectionsByCourseId.get(course.id) || [];
            map.set(
                course.id,
                sections.filter((s) => s.term === selectedTerm),
            );
        });
        return map;
    }, [pinnedCourses, sectionsByCourseId, selectedTerm]);

    return (
        <>
            {pinnedCourses.map((course: ApiCourseWithSections) => {
                const isExpanded = expandedId === course.id;
                const sections = filteredSectionsMap.get(course.id)!;
                return (
                    <CourseCard
                        key={course.id}
                        course={course}
                        sections={sections}
                        isExpanded={isExpanded}
                        selectedSections={selectedSections}
                        onSectionSelect={onSectionSelect}
                        onExpandCourse={() => handleExpand(course.id)}
                    />
                );
            })}
        </>
    );
}

export default CourseList;
