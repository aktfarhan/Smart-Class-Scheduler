import clsx from 'clsx';
import React from 'react';
import { ChevronDown, CheckCircle2 } from 'lucide-react';
import { formatTimes } from '../../../utils/formatTime';
import type { ApiCourseWithSections, ApiSectionWithRelations } from '../../../types';

interface CourseCardProps {
    course: ApiCourseWithSections;
    sections: ApiSectionWithRelations[];
    isExpanded: boolean;
    unofferedLabel?: string | null;
    selectedSections: Set<number>;
    onExpandCourse: () => void;
    onSectionSelect: (courseId: number, sectionId: number) => void;
}

function CourseCard({
    course,
    sections,
    isExpanded,
    unofferedLabel,
    selectedSections,
    onExpandCourse,
    onSectionSelect,
}: CourseCardProps) {
    return (
        <div className={clsx('relative', unofferedLabel && 'opacity-60')}>
            <button
                onClick={onExpandCourse}
                type="button"
                aria-expanded={isExpanded}
                className={clsx(
                    'relative flex w-full cursor-pointer items-center gap-3 overflow-hidden rounded-lg border-2 p-4 transition-all duration-100',
                    isExpanded
                        ? 'border-theme-blue bg-theme-blue/5'
                        : 'border-slate-200 bg-slate-50/50 hover:border-slate-300',
                )}
            >
                <div className="flex min-w-0 flex-1 flex-col text-left">
                    <div className="flex items-center gap-1.5">
                        <span
                            className={clsx(
                                'font-space w-fit rounded px-2 py-0.5 text-[10px] font-bold tracking-tight uppercase',
                                isExpanded
                                    ? 'bg-theme-blue text-white'
                                    : 'bg-slate-100 text-slate-500',
                            )}
                        >
                            {course.department.code} {course.code}
                        </span>
                        {unofferedLabel && (
                            <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold tracking-tight text-amber-700 uppercase">
                                {unofferedLabel}
                            </span>
                        )}
                    </div>
                    <span className="mt-1 truncate text-xs font-semibold text-slate-800">
                        {course.title}
                    </span>
                </div>
                <ChevronDown
                    size={16}
                    className={clsx(
                        'shrink-0 text-slate-400 transition-transform duration-300',
                        isExpanded && '-rotate-180',
                    )}
                />
            </button>
            {isExpanded && (
                <div className="animate-in fade-in slide-in-from-top-2 border-theme-blue/30 relative mt-1.5 ml-5 flex flex-col gap-1.5 rounded-l-md border-l-2 py-1 pl-3 duration-200">
                    {(() => {
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
                                    <span className="text-[10px] text-slate-400 italic">
                                        No scheduled sections available
                                    </span>
                                </div>
                            );
                        }
                        return visibleSections.map((section: ApiSectionWithRelations) => {
                            const isActive = selectedSections.has(section.id);
                            return (
                                <button
                                    type="button"
                                    key={section.id}
                                    onClick={() => onSectionSelect(course.id, section.id)}
                                    className={clsx(
                                        'flex w-full cursor-pointer items-center justify-between rounded-lg border-2 px-4 py-2.5 text-left transition-all',
                                        isActive
                                            ? 'bg-theme-blue border-theme-blue text-white shadow-md'
                                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300',
                                    )}
                                >
                                    <div className="flex flex-col">
                                        <div className="mb-1 flex items-center gap-2">
                                            <span className="text-[11px] leading-none font-bold uppercase">
                                                Section {section.sectionNumber}
                                            </span>
                                            {section.sectionNumber.endsWith('D') && (
                                                <span className="rounded-sm bg-gray-200 px-1 text-[8px] font-black text-slate-500">
                                                    DISC
                                                </span>
                                            )}
                                            {section.sectionNumber.endsWith('L') && (
                                                <span className="rounded-sm bg-gray-200 px-1 text-[8px] font-black text-slate-500">
                                                    LAB
                                                </span>
                                            )}
                                        </div>
                                        <span
                                            className={clsx(
                                                'text-[10px] font-medium',
                                                isActive ? 'text-blue-100' : 'text-slate-400',
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
