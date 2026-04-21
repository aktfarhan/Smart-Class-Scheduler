import clsx from 'clsx';
import MiniCalendar from './MiniCalendar';
import { minutesToLabel, formatDuration } from '../../../../utils/formatTime';
import type { RankedSchedule, SortHighlight } from '../../../../types';

interface ScheduleCardProps {
    rank: number;
    schedule: RankedSchedule;
    highlight: SortHighlight;
    isSelected: boolean;
    showWeekend: boolean;
    courseColorMap: Map<string, string>;
    onSelect: () => void;
    onHoverEnter: () => void;
    onHoverLeave: () => void;
}

function ScheduleCard({
    rank,
    schedule,
    highlight,
    isSelected,
    showWeekend,
    courseColorMap,
    onSelect,
    onHoverEnter,
    onHoverLeave,
}: ScheduleCardProps) {
    // Applied to the stat that the current sort preset ranks by
    const emphasis = 'text-theme-blue font-bold';

    return (
        <button
            type="button"
            onClick={onSelect}
            onMouseEnter={onHoverEnter}
            onMouseLeave={onHoverLeave}
            className={clsx(
                'flex w-full cursor-pointer flex-col gap-3 rounded-xl border-2 p-3 text-left transition-all active:scale-[0.98]',
                isSelected
                    ? 'border-theme-blue bg-theme-blue/10'
                    : 'border-slate-200 bg-slate-100 opacity-80 hover:border-slate-300 hover:opacity-100 hover:shadow-md',
            )}
        >
            <MiniCalendar
                sections={schedule.sections}
                showWeekend={showWeekend}
                courseColorMap={courseColorMap}
            />
            <div className="flex items-center gap-2">
                <span
                    className={clsx(
                        'font-space flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[12px] font-bold',
                        isSelected ? 'bg-theme-blue text-white' : 'bg-slate-100 text-slate-500',
                    )}
                >
                    {rank}
                </span>
                <p className="text-[12px] font-medium text-slate-500">
                    <span className={clsx(highlight === 'days' && emphasis)}>
                        {schedule.activeDayList}
                    </span>
                    {' · '}
                    {highlight === 'time' ? (
                        <span className={emphasis}>
                            {formatDuration(schedule.totalTimeOnCampus)} on campus
                        </span>
                    ) : (
                        <>
                            <span className={clsx(highlight === 'start' && emphasis)}>
                                {minutesToLabel(schedule.earliestStart)}
                            </span>
                            {' – '}
                            <span className={clsx(highlight === 'end' && emphasis)}>
                                {minutesToLabel(schedule.latestEnd)}
                            </span>
                        </>
                    )}
                </p>
            </div>
        </button>
    );
}

export default ScheduleCard;
