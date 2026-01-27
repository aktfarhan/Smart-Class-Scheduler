import { CalendarRange } from 'lucide-react';
import { formatTimeLabel } from '../../../../../utils/formatTime';
import type { RefObject } from 'react';
import type { TimeRange } from '../../../../../types';

interface TimeRangeSliderProps {
    min: number;
    max: number;
    timeRange: TimeRange;
    sliderRef: RefObject<HTMLDivElement | null>;
    onPointerDown: (thumb: 'start' | 'end') => (e: React.PointerEvent<Element>) => void;
}

function TimeRangeSlider({ min, max, timeRange, sliderRef, onPointerDown }: TimeRangeSliderProps) {
    const startPercent = ((timeRange.start - min) / (max - min)) * 100;
    const endPercent = ((timeRange.end - min) / (max - min)) * 100;
    return (
        <div className="space-y-4">
            <div className="flex justify-between">
                <div className=" flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
                    <CalendarRange size={12} /> Preferred Time
                </div>
                <span className="text-[11px] font-bold text-theme-blue px-2 py-0.5 border rounded-md border-theme-blue/10 bg-theme-blue/5">
                    {formatTimeLabel(timeRange.start)} - {formatTimeLabel(timeRange.end)}
                </span>
            </div>
            <div
                ref={sliderRef}
                className="flex items-center w-full h-6 relative select-none touch-none"
            >
                <div className="w-full h-1.5 absolute rounded-full bg-gray-200" />
                <div
                    className="absolute h-1.5 rounded-full bg-theme-blue"
                    style={{
                        left: `${startPercent}%`,
                        width: `${endPercent - startPercent}%`,
                    }}
                />
                <div
                    onPointerDown={onPointerDown('start')}
                    className="w-4 h-4 z-20 absolute border-2 rounded-full border-theme-blue cursor-grab active:cursor-grabbing hover:scale-110 shadow-md bg-white transition-transform -translate-x-1/2"
                    style={{ left: `${startPercent}%` }}
                />
                <div
                    onPointerDown={onPointerDown('end')}
                    className="w-4 h-4 z-20 absolute border-2 rounded-full border-theme-blue cursor-grab active:cursor-grabbing hover:scale-110 shadow-md bg-white transition-transform -translate-x-1/2"
                    style={{ left: `${endPercent}%` }}
                />
            </div>
        </div>
    );
}

export default TimeRangeSlider;
