import clsx from 'clsx';
import CourseMeta from './CourseMeta';
import { Bookmark } from 'lucide-react';
import Sections from '../section/Sections';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { ApiSectionWithRelations, ApiCourseWithDepartment } from '../../../types';

interface CourseProps {
    course: ApiCourseWithDepartment;
    isPinned: boolean;
    sections: ApiSectionWithRelations[];
    isSectionExpanded: boolean;
    onTogglePin: () => void;
    onToggleSectionExpand: () => void;
}

function Course({
    course,
    sections,
    isPinned,
    isSectionExpanded,
    onTogglePin,
    onToggleSectionExpand,
}: CourseProps) {
    // Whether this course has more than one section
    const isMultiple = sections.length > 1;

    // Ref to the description paragraph for overflow measurement
    const descriptionRef = useRef<HTMLParagraphElement>(null);

    // Tracks whether the description actually overflows its container
    const [isOverflowing, setIsOverflowing] = useState(false);

    // Controls whether the course description is expanded or line-clamped
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

    // Compute a display-friendly instructor label
    const handleInstructors = useMemo(() => {
        if (isMultiple) return 'Multiple';
        const instructors = sections[0]?.instructors || [];
        if (instructors.length === 0) return 'TBA';
        return instructors
            .map((instructor) => `${instructor.firstName} ${instructor.lastName}`)
            .join(', ');
    }, [isMultiple, sections]);

    // Detect whether the description text overflows its container
    useEffect(() => {
        const element = descriptionRef.current;
        if (!element) return;
        const checkOverflow = () => {
            // scrollHeight (total content height) vs clientHeight (visible height)
            if (!isDescriptionExpanded) {
                setIsOverflowing(element.scrollHeight > element.clientHeight);
            }
        };
        // ResizeObserver handles overflow checks if the window or container size changes
        const observer = new ResizeObserver(checkOverflow);
        observer.observe(element);
        checkOverflow();

        // Cleanup observer on unmount
        return () => observer.disconnect();
    }, [isDescriptionExpanded]);

    // Shared bookmark icon styles based on pinned state
    const iconStyles = clsx(
        'transition-all duration-500 ease-out',
        isPinned
            ? 'fill-theme-blue text-theme-blue scale-110 drop-shadow-[0_0_8px_rgba(37,99,235,0.4)]'
            : 'text-gray-400 group-hover:text-gray-600',
    );
    return (
        <div className="max-w-7xl sm:mx-10 mx-4 mt-4">
            <div
                className={clsx(
                    'flex flex-col lg:flex-row items-stretch relative border-2 border-gray-200 overflow-hidden transition-shadow bg-white',
                    isSectionExpanded ? 'rounded-t-xl' : 'rounded-xl hover:shadow-sm',
                )}
            >
                <button
                    onClick={onTogglePin}
                    className={clsx(
                        'lg:flex items-center justify-center relative min-w-14 border-r-2 border-gray-100 cursor-pointer transition-all duration-200 group hidden overflow-hidden',
                        isPinned ? 'bg-slate-50' : 'hover:bg-gray-50',
                    )}
                >
                    {isPinned && (
                        <div className="absolute w-1.5 left-0 top-4 bottom-4 rounded-r-full bg-theme-blue"></div>
                    )}
                    <Bookmark
                        size={22}
                        className={`${iconStyles} active:scale-110 transition-transform duration-150 ease-out`}
                    />
                </button>
                <div className="flex flex-col md:flex-row flex-1 items-stretch">
                    <div className="flex-1 relative md:p-6 lg:pr-6 p-5 grow">
                        <button
                            onClick={() => onTogglePin()}
                            className={clsx(
                                'absolute sm:top-5 sm:right-5 lg:hidden top-4 right-4 z-10 p-2.5 border rounded-full shadow-sm cursor-pointer transition-all duration-300 active:scale-90',
                                isPinned
                                    ? 'shadow-inner border-blue-200 bg-blue-50'
                                    : 'border-gray-100 backdrop-blur-sm bg-white/90 hover:bg-gray-50',
                            )}
                        >
                            <Bookmark size={20} className={iconStyles} />
                        </button>
                        <h2 className="lg:pr-0 pr-10 font-semibold text-xl text-gray-900 leading-tight">
                            {course.title}
                        </h2>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 font-medium text-sm text-gray-600">
                            <span className="px-2 py-0.5 rounded text-gray-700 bg-gray-100">
                                {course.department.code} {course.code}
                            </span>
                            <span className="sm:inline hidden text-gray-300">•</span>
                            <span>{handleInstructors}</span>
                            <span className="sm:inline hidden text-gray-300">•</span>
                            <span>{course.department.title}</span>
                        </div>
                        <p
                            ref={descriptionRef}
                            onClick={() =>
                                (isOverflowing || isDescriptionExpanded) &&
                                setIsDescriptionExpanded(!isDescriptionExpanded)
                            }
                            className={clsx(
                                'mt-3 text-sm text-gray-600 leading-relaxed select-none',
                                isDescriptionExpanded ? 'line-clamp-none' : 'line-clamp-2',
                                isOverflowing || isDescriptionExpanded
                                    ? 'cursor-pointer'
                                    : 'cursor-default',
                            )}
                        >
                            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Doloremque
                            corporis, dolore itaque pariatur deleniti quisquam exercitationem nihil
                            magnam, repellendus ipsum aliquam neque sed. Cupiditate saepe
                            consectetur molestiae sapiente animi nulla! Lorem ipsum dolor, sit amet
                            consectetur adipisicing elit. Error, vel tenetur corrupti consequuntur
                            recusandae, aut numquam qui quia, explicabo adipisci non velit nihil
                            magnam. Enim ullam dolor quia quo est.
                        </p>
                    </div>
                    <div className="md:block w-px my-6 hidden bg-gray-200" />
                    <CourseMeta
                        showSections={isSectionExpanded}
                        setShowSections={onToggleSectionExpand}
                        sections={sections}
                    />
                </div>
            </div>
            {isSectionExpanded && (
                <div className="w-full">
                    <div className="ml-0 lg:ml-14 border-x-2 border-b-2 border-gray-200 rounded-b-xl bg-white overflow-hidden shadow-inner">
                        <Sections sections={sections} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default React.memo(Course);
