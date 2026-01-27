import clsx from 'clsx';
import { Clock } from 'lucide-react';
import { DATA_MAPS } from '../../../constants';

interface TimeSelectorProps {
    times: readonly string[];
    selectedTime: { start?: string; end?: string } | string | null | undefined;
    onSelect: (time: string) => void;
}

function TimeSelector({ times, selectedTime, onSelect }: TimeSelectorProps) {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase">
                <Clock size={12} /> Time Range
            </div>
            <div className="grid grid-cols-2 gap-1.5">
                {times.map((t) => {
                    const isSelected =
                        typeof selectedTime === 'string'
                            ? selectedTime.toLowerCase() === t.toLowerCase()
                            : selectedTime?.start === DATA_MAPS.PERIOD_MAP[t.toLowerCase()]?.start;
                    return (
                        <button
                            key={t}
                            onClick={() => onSelect(t)}
                            className={clsx(
                                'cursor-pointer rounded-lg border-2 py-2 text-[12px] font-semibold transition-all',
                                isSelected
                                    ? 'text-theme-blue border-theme-blue bg-theme-blue/5'
                                    : 'border-gray-100 text-gray-400 hover:border-gray-200',
                            )}
                        >
                            {t}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default TimeSelector;
