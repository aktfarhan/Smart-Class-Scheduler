import clsx from 'clsx';
import React from 'react';
import { ChevronDown, CheckCircle2 } from 'lucide-react';
import { formatTimes } from '../../../../utils/formatTime';
import type { ApiCourseWithSections } from '../../../../types';
import type { ApiSectionWithRelations } from '../../../../types';

interface CourseCardProps {
    course: ApiCourseWithSections;
    sections: ApiSectionWithRelations[];
    isExpanded: boolean;
    // FIX: Changed from activeSectionId: number to selectedSections: Set<number>
    selectedSections: Set<number>;
    onExpandCourse: () => void;
    onSectionSelect: (courseId: number, sectionId: number) => void;
}

function CourseCard({
    course,
    sections,
    isExpanded,
    selectedSections,
    onExpandCourse,
    onSectionSelect,
}: CourseCardProps) {
    return (
        <div className="relative">
            <button
                onClick={onExpandCourse}
                type="button"
                aria-expanded={isExpanded}
                className={clsx(
                    'flex w-full cursor-pointer items-center justify-between rounded-lg border-2 p-3.5 transition-all duration-100',
                    isExpanded
                        ? 'border-theme-blue'
                        : 'border-gray-100 shadow-xs hover:border-gray-300',
                )}
            >
                <div className="flex flex-col text-left">
                    <span className="text-theme-blue text-[11px] font-bold tracking-wider uppercase">
                        {course.department.code} {course.code}
                    </span>
                    <span className="max-w-42.5 truncate text-[10px] leading-tight font-semibold text-gray-800">
                        {course.title}
                    </span>
                </div>
                <ChevronDown
                    size={16}
                    className={clsx(
                        'text-gray-400 transition-transform duration-300',
                        isExpanded && '-rotate-180',
                    )}
                />
            </button>
            {isExpanded && (
                <div className="border-theme-blue/30 relative mt-1.5 ml-5 flex flex-col gap-1.5 rounded-l-md border-l-2 py-1 pl-3">
                    {(() => {
                        // 1. Pre-filter the sections to completely remove any where all meetings are "TBA"
                        const visibleSections = sections.filter((section) =>
                            section.meetings?.some(
                                (m) =>
                                    m.startTime?.toUpperCase() !== 'TBA' &&
                                    m.endTime?.toUpperCase() !== 'TBA',
                            ),
                        );

                        if (visibleSections.length === 0) {
                            return (
                                <div className="flex items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-3">
                                    <span className="text-[10px] text-gray-400 italic">
                                        No scheduled sections available
                                    </span>
                                </div>
                            );
                        }

                        // 2. Map only over the sections that have real times
                        return visibleSections.map((section: ApiSectionWithRelations) => {
                            const isActive = selectedSections.has(section.id);
                            return (
                                <button
                                    key={section.id}
                                    onClick={() => onSectionSelect(course.id, section.id)}
                                    className={clsx(
                                        'flex w-full cursor-pointer items-center justify-between rounded-lg border px-4 py-2.5 text-left transition-all',
                                        isActive
                                            ? 'bg-theme-blue border-theme-blue text-white shadow-md'
                                            : 'border-gray-100 bg-gray-50/80 text-gray-600 hover:bg-gray-100',
                                    )}
                                >
                                    <div className="flex flex-col">
                                        <div className="mb-1 flex items-center gap-2">
                                            <span className="text-[11px] leading-none font-bold uppercase">
                                                Section {section.sectionNumber}
                                            </span>
                                            {section.sectionNumber.endsWith('D') && (
                                                <span className="rounded-sm bg-gray-200 px-1 text-[8px] font-black text-gray-500">
                                                    DISC
                                                </span>
                                            )}
                                            {section.sectionNumber.endsWith('L') && (
                                                <span className="rounded-sm bg-gray-200 px-1 text-[8px] font-black text-gray-500">
                                                    LAB
                                                </span>
                                            )}
                                        </div>
                                        <span
                                            className={clsx(
                                                'text-[9px] font-medium',
                                                isActive ? 'text-blue-100' : 'text-gray-400',
                                            )}
                                        >
                                            {formatTimes(section.meetings)}
                                        </span>
                                    </div>
                                    {isActive && <CheckCircle2 size={14} />}
                                </button>
                            );
                        });
                    })()}
                </div>
            )}
        </div>
    );
}

export default React.memo(CourseCard);
