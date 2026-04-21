import clsx from 'clsx';
import ScheduleCard from './ScheduleCard';
import React, { useMemo, useState } from 'react';
import { COURSE_COLORS } from '../../../../constants';
import { BarChart3, ChevronDown } from 'lucide-react';
import { scheduleHasWeekend } from '../../../../utils/scheduleHasWeekend';
import { SORT_OPTIONS } from '../../../../scheduling/scheduleScoring';
import type { RankedSchedule } from '../../../../types';

interface ScheduleResultsProps {
    sortPreset: number;
    rankedSchedules: RankedSchedule[];
    selectedResultIndex: number;
    totalScoredSchedules: number;
    onSortChange: (index: number) => void;
    onResultHover: (index: number | null) => void;
    onResultSelect: (index: number) => void;
}

function ScheduleResults({
    sortPreset,
    rankedSchedules,
    selectedResultIndex,
    totalScoredSchedules,
    onSortChange,
    onResultHover,
    onResultSelect,
}: ScheduleResultsProps) {
    const [isOpen, setIsOpen] = useState(true);

    // Expand mini-calendars to 7 columns when schedule has sa/su
    const showWeekend = rankedSchedules.some((schedule) => scheduleHasWeekend(schedule.sections));

    // Build a color map from the first ranked schedule
    const courseColorMap = useMemo(() => {
        if (rankedSchedules.length === 0) return new Map<string, string>();

        // 1. Collect course codes from the top-ranked schedule
        const codes = new Set<string>();
        for (const section of rankedSchedules[0].sections) {
            codes.add(`${section.course.department.code} ${section.course.code}`);
        }

        // 2. Sort alphabetically and assign each course a color from the palette
        const map = new Map<string, string>();
        [...codes].sort().forEach((code, index) => {
            map.set(code, COURSE_COLORS[index % COURSE_COLORS.length].miniBg);
        });
        return map;
    }, [rankedSchedules]);

    return (
        <div className="border-b border-gray-100 bg-gray-50/50">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full cursor-pointer items-center justify-between p-5 hover:bg-gray-100/60"
            >
                <div className="flex items-center gap-3">
                    <div className="bg-theme-blue flex h-9 w-9 items-center justify-center rounded-lg text-white shadow-sm">
                        <BarChart3 size={16} />
                    </div>
                    <span className="text-[13px] font-bold text-slate-800">Schedule Results</span>
                    {totalScoredSchedules > 0 && (
                        <div className="text-theme-blue border-theme-blue/10 bg-theme-blue/5 rounded-md border px-2 py-0.5 text-[11px] font-bold">
                            {totalScoredSchedules}
                        </div>
                    )}
                </div>
                <ChevronDown
                    size={18}
                    className={clsx(
                        'text-slate-400 transition-transform duration-200 ease-in-out',
                        isOpen && '-rotate-180',
                    )}
                />
            </button>
            {isOpen && (
                <div className="animate-in fade-in slide-in-from-top-2 mt-1 space-y-3 px-5 pb-5">
                    {rankedSchedules.length > 0 ? (
                        <>
                            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border-2 border-slate-200 bg-slate-100 shadow-inner">
                                {SORT_OPTIONS.map((option, index) => (
                                    <button
                                        type="button"
                                        key={option.label}
                                        onClick={() => onSortChange(index)}
                                        className={clsx(
                                            'cursor-pointer py-2 text-center text-[12px] font-bold transition-all active:scale-[0.97]',
                                            sortPreset === index
                                                ? 'bg-theme-blue text-white shadow-sm'
                                                : 'bg-white text-slate-500 hover:bg-slate-50',
                                        )}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                            <div className="flex flex-col gap-2">
                                {rankedSchedules.map((schedule, index) => (
                                    <ScheduleCard
                                        key={`${sortPreset}-${index}`}
                                        rank={index + 1}
                                        schedule={schedule}
                                        highlight={SORT_OPTIONS[sortPreset].highlight}
                                        isSelected={selectedResultIndex === index}
                                        showWeekend={showWeekend}
                                        courseColorMap={courseColorMap}
                                        onSelect={() => onResultSelect(index)}
                                        onHoverEnter={() => onResultHover(index)}
                                        onHoverLeave={() => onResultHover(null)}
                                    />
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-slate-200 bg-slate-50/50 py-6 text-center">
                            <span className="text-[11px] font-semibold text-slate-400">
                                Results are out of date
                            </span>
                            <span className="text-[10px] text-slate-300">
                                Click Generate to refresh
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default React.memo(ScheduleResults);
