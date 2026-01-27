import clsx from 'clsx';
import { Clock } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';

interface MinGapSliderProps {
    minGap: number;
    maxGap: number;
    gapPresets: readonly number[];
    setMinGap: Dispatch<SetStateAction<number>>;
}

function MinGapSlider({ minGap, maxGap, gapPresets, setMinGap }: MinGapSliderProps) {
    const percentage = (minGap / maxGap) * 100;
    return (
        <div className="space-y-4">
            <div className="flex justify-between">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest leading-none">
                    <Clock size={12} /> Minimum Gap
                </div>
                <span className="text-[11px] font-bold text-theme-blue px-2 py-0.5 border rounded-md border-theme-blue/10 bg-theme-blue/5">
                    {minGap >= 60 ? `${Math.floor(minGap / 60)}h ${minGap % 60}m` : `${minGap}m`}
                </span>
            </div>
            <div className="flex items-center w-full h-6 relative select-none touch-none group">
                <div className="absolute w-full h-1.5 rounded-full bg-gray-200" />
                <div
                    className="absolute h-1.5 rounded-full bg-theme-blue "
                    style={{ width: `${percentage}%` }}
                />
                <input
                    type="range"
                    aria-label="Adjust minimum gap"
                    min={0}
                    max={maxGap}
                    step={5}
                    value={minGap}
                    onChange={(e) => setMinGap(Number(e.target.value))}
                    className="absolute w-full h-full scale-x-[1.05] appearance-none bg-transparent cursor-grab active:cursor-grabbing opacity-0"
                />
                <div
                    className="absolute w-4 h-4 border-2 rounded-full border-theme-blue shadow-md pointer-events-none group-hover:scale-110 bg-white -translate-x-1/2 transition-transform"
                    style={{ left: `${percentage}%` }}
                />
            </div>
            <div className="flex gap-1.5">
                {gapPresets.map((gap) => (
                    <button
                        key={gap}
                        onClick={() => setMinGap(gap)}
                        className={clsx(
                            'flex-1 text-[11px] font-bold py-1.5 border rounded-md cursor-pointer transition-all',
                            minGap === gap
                                ? 'bg-theme-blue border-theme-blue text-white'
                                : 'text-gray-400 border-gray-200 hover:border-theme-blue/40 bg-gray-100/70',
                        )}
                    >
                        {gap === 0 ? 'None' : gap < 60 ? `${gap}m` : `${gap / 60}h`}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default MinGapSlider;
