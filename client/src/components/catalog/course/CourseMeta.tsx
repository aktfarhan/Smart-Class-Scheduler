import clsx from 'clsx';
import { useMemo } from 'react';
import { DATA_MAPS } from '../../../constants';
import { formatTime } from '../../../utils/formatTime';
import { ChevronDown, CalendarClock, CalendarDays, Clock3, MapPin } from 'lucide-react';
import type { ApiSectionWithRelations } from '../../../types';

interface CourseMetaProps {
    showSections: boolean;
    setShowSections: () => void;
    sections: ApiSectionWithRelations[];
}

function CourseMeta({ showSections, setShowSections, sections }: CourseMetaProps) {
    // Determine if there are multiple sections, and store the first section
    const isMultiple = sections.length > 1;
    const firstSection = sections[0];

    // Processes raw meeting days into a sorted string
    const formattedDays = useMemo(() => {
        const meetings = firstSection?.meetings;
        if (!meetings || meetings.length === 0) return 'TBA';

        // 1. Extract unique day abbreviations from all meetings
        const uniqueAbbrs = Array.from(
            new Set(
                meetings.map(
                    (meeting) => DATA_MAPS.DAY_MAP[meeting.day.toLowerCase()] || meeting.day,
                ),
            ),
        );

        // 2. Sort days based on a standard week rank (Mon=1, Tue=2, etc.)
        const sortedAbbrs = uniqueAbbrs.sort((a, b) => {
            return (DATA_MAPS.DAY_RANK[a] ?? 99) - (DATA_MAPS.DAY_RANK[b] ?? 99);
        });

        // 3. Return full name for single days (Monday)
        if (sortedAbbrs.length === 1) {
            const day = sortedAbbrs[0];
            return DATA_MAPS.FULL_DAY_MAP[day] || day;
        }
        return sortedAbbrs.join(', ');
    }, [firstSection?.meetings]);

    return (
        <div className="flex flex-col justify-start w-full md:w-64 mt-1 gap-3 p-5 md:p-6 border-t-2 md:border-t-0 md:bg-white border-gray-100 bg-gray-50">
            {isMultiple ? (
                <>
                    <div className="flex flex-row md:flex-col md:items-start items-center gap-2">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                <CalendarClock size={16} className="text-gray-400" />
                                <span>Multiple Semesters</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                <CalendarDays size={16} className="text-gray-400" />
                                <span>Multiple Sections</span>
                            </div>
                        </div>
                        <button
                            onClick={setShowSections}
                            className="flex items-center justify-center w-40 md:mt-2 py-2 gap-2 ml-auto md:ml-0 cursor-pointer text-sm font-bold rounded-md border border-theme-blue text-theme-blue hover:bg-theme-blue hover:text-white duration-200 active:scale-95 shrink-0"
                        >
                            {showSections ? 'Hide' : 'Show'} Sections
                            <ChevronDown
                                size={16}
                                className={clsx(
                                    'transition-transform duration-200 ease-in-out',
                                    showSections ? '-rotate-180' : 'rotate-0',
                                )}
                            />
                        </button>
                    </div>
                </>
            ) : (
                <div className="grid grid-cols-2 md:flex md:flex-col gap-2 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                        <CalendarClock size={16} className="text-gray-400" />
                        <p>{firstSection?.term || 'TBA'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <CalendarDays size={16} className="text-gray-400" />
                        <p>{formattedDays}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock3 size={16} className="text-gray-400" />
                        <p>{formatTime(firstSection?.meetings[0]) || 'TBA'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-gray-400" />
                        <span>{firstSection?.meetings[0]?.location || 'TBA'}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CourseMeta;
