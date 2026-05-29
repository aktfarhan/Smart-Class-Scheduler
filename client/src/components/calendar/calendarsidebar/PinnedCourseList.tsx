import clsx from 'clsx';
import CourseCard from './CourseCard';
import { useCallback, useMemo } from 'react';
import { Bookmark, ChevronDown } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';
import { formatAYLabel, getAYForTerm } from '../../../utils/academicYear';
import type { AcademicTerm, ApiCourseWithSections, ApiSectionWithRelations } from '../../../types';

interface PinnedCourseListProps {
    expandedId: number | null;
    selectedTerm: AcademicTerm;
    isCoursesOpen: boolean;
    pinnedCourses: ApiCourseWithSections[];
    selectedSections: Set<number>;
    sectionsByCourseId: Map<number, ApiSectionWithRelations[]>;
    setExpandedId: Dispatch<SetStateAction<number | null>>;
    onSectionSelect: (courseId: number, sectionId: number) => void;
    setIsCoursesOpen: Dispatch<SetStateAction<boolean>>;
}

function PinnedCourseList({
    expandedId,
    selectedTerm,
    pinnedCourses,
    isCoursesOpen,
    selectedSections,
    sectionsByCourseId,
    setExpandedId,
    onSectionSelect,
    setIsCoursesOpen,
}: PinnedCourseListProps) {
    const handleExpand = useCallback(
        (courseId: number) => {
            setExpandedId((prev) => (prev === courseId ? null : courseId));
        },
        [setExpandedId],
    );

    // Build per-course display data in a single pass
    const activeAY = getAYForTerm(selectedTerm);
    const displayData = useMemo(() => {
        const map = new Map<number, { sections: ApiSectionWithRelations[]; unoffered: boolean }>();
        pinnedCourses.forEach((course) => {
            const allSections = sectionsByCourseId.get(course.id)!;
            const termSections = allSections.filter((section) => section.term === selectedTerm);

            // Unoffered means no sections in the entire AY
            const hasInAY = allSections.some((section) => getAYForTerm(section.term) === activeAY);

            map.set(course.id, { sections: termSections, unoffered: !hasInAY });
        });
        return map;
    }, [pinnedCourses, sectionsByCourseId, selectedTerm, activeAY]);

    return (
        <div className="border-b border-gray-100 bg-gray-50/50">
            <button
                type="button"
                onClick={() => setIsCoursesOpen(!isCoursesOpen)}
                className="flex w-full cursor-pointer items-center justify-between p-5 hover:bg-gray-100/60"
            >
                <div className="flex items-center gap-3">
                    <div className="bg-theme-blue flex h-9 w-9 items-center justify-center rounded-lg text-white shadow-sm">
                        <Bookmark size={16} />
                    </div>
                    <span className="text-[13px] font-bold text-slate-800">Pinned Courses</span>
                    <div className="text-theme-blue border-theme-blue/10 bg-theme-blue/5 rounded-md border px-2 py-0.5 text-[11px] font-bold">
                        {pinnedCourses.length}
                    </div>
                </div>
                <ChevronDown
                    size={18}
                    className={clsx(
                        'text-slate-400 transition-transform duration-200 ease-in-out',
                        isCoursesOpen && '-rotate-180',
                    )}
                />
            </button>
            {isCoursesOpen && (
                <div className="animate-in fade-in slide-in-from-top-2 mt-1 flex flex-col gap-3 px-5 pb-5">
                    {pinnedCourses.length > 0 ? (
                        pinnedCourses.map((course: ApiCourseWithSections) => {
                            const isExpanded = expandedId === course.id;
                            const { sections, unoffered } = displayData.get(course.id)!;
                            const unofferedLabel = unoffered
                                ? `Not offered in ${formatAYLabel(activeAY)}`
                                : null;

                            return (
                                <CourseCard
                                    key={course.id}
                                    course={course}
                                    sections={sections}
                                    isExpanded={isExpanded}
                                    selectedSections={selectedSections}
                                    onSectionSelect={onSectionSelect}
                                    onExpandCourse={() => handleExpand(course.id)}
                                    unofferedLabel={unofferedLabel}
                                />
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-slate-200 bg-slate-50/50 py-6 text-center">
                            <span className="text-[11px] font-semibold text-slate-400">
                                No courses pinned yet
                            </span>
                            <span className="text-[10px] text-slate-300">
                                Pin courses from the catalog tab
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default PinnedCourseList;
