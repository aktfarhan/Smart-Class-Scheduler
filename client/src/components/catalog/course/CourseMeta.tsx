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

    // Resolve term label based on unique terms across sections
    const uniqueTerms = new Set(sections.map((section) => section.term));
    const termLabel = uniqueTerms.size > 1 ? 'Multiple Semesters' : firstSection?.term || 'TBA';

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
        <div className="mt-1 flex w-full flex-col justify-start gap-3 border-t-2 border-gray-100 bg-gray-50 p-5 md:w-64 md:border-t-0 md:bg-white md:p-6">
            {isMultiple ? (
                <>
                    <div className="flex flex-row items-center gap-2 md:flex-col md:items-start">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-sm text-slate-700">
                                <CalendarClock size={16} className="text-slate-400" />
                                <span>{termLabel}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-700">
                                <CalendarDays size={16} className="text-slate-400" />
                                <span>Multiple Sections</span>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={setShowSections}
                            className="border-theme-blue text-theme-blue hover:bg-theme-blue ml-auto flex w-40 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md border py-2 text-sm font-bold duration-200 hover:text-white active:scale-95 md:mt-2 md:ml-0"
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
                <div className="grid grid-cols-2 gap-2 text-sm text-slate-700 md:flex md:flex-col">
                    <div className="flex items-center gap-2">
                        <CalendarClock size={16} className="text-slate-400" />
                        <p>{termLabel}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <CalendarDays size={16} className="text-slate-400" />
                        <p>{formattedDays}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock3 size={16} className="text-slate-400" />
                        <p>{formatTime(firstSection?.meetings[0]) || 'TBA'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-slate-400" />
                        <span title={firstSection?.meetings[0]?.location || 'TBA'}>
                            {(firstSection?.meetings[0]?.location || 'TBA').replace('Wheatley-Peters', 'Wheatley-P')}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CourseMeta;
