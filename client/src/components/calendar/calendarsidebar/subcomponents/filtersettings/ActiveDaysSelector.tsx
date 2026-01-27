import clsx from 'clsx';
import { CheckSquare } from 'lucide-react';
import type { DayLiteral } from '../../../../../constants';

interface ActiveDaysSelectorProps {
    days: DayLiteral[];
    selectedDays: DayLiteral[] | undefined;
    toggleDay: (day: DayLiteral) => void;
}

function ActiveDaysSelector({ days, selectedDays, toggleDay }: ActiveDaysSelectorProps) {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase">
                <CheckSquare size={12} /> Active Days
            </div>
            <div className="flex justify-between gap-1">
                {days.map((day) => {
                    const isActive = selectedDays?.includes(day);
                    return (
                        <button
                            key={day}
                            onClick={() => toggleDay(day)}
                            className={clsx(
                                'flex-1 cursor-pointer rounded-md border py-2 text-[11px] font-bold transition-all',
                                isActive
                                    ? 'border-theme-blue bg-theme-blue text-white shadow-md'
                                    : 'hover:border-theme-blue/40 border-gray-200 bg-gray-100 text-gray-400',
                            )}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default ActiveDaysSelector;
