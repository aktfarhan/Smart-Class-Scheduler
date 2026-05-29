import clsx from 'clsx';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { formatAYLabel } from '../../utils/academicYear';

interface YearPickerPopoverProps {
    value: number;
    options: number[];
    onChange: (ayStart: number) => void;
}

function YearPickerPopover({ value, options, onChange }: YearPickerPopoverProps) {
    const [isOpen, setIsOpen] = useState(false);
    const isDisabled = options.length === 0;

    return (
        <div className="relative">
            <button
                type="button"
                disabled={isDisabled}
                onClick={() => setIsOpen((prev) => !prev)}
                className={clsx(
                    'relative z-30 flex w-24 cursor-pointer items-center gap-1 rounded-md border-2 px-2 py-1 transition-all disabled:cursor-not-allowed disabled:opacity-60',
                    isOpen
                        ? 'border-slate-300 bg-white'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300',
                )}
            >
                <div className="flex flex-1 items-center justify-center gap-1">
                    <span className="font-space text-[10px] font-bold tracking-wide text-slate-500">
                        AY
                    </span>
                    <span className="font-space text-[11px] font-bold tracking-wide text-slate-700">
                        {formatAYLabel(value)}
                    </span>
                </div>
                <ChevronDown
                    size={12}
                    strokeWidth={2.5}
                    className={clsx(
                        'text-slate-400 transition-transform duration-200',
                        isOpen && '-rotate-180',
                    )}
                />
            </button>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />
                    <div className="absolute z-30 mt-1 flex max-h-60 w-24 flex-col overflow-y-auto rounded-md border-2 border-slate-300 bg-white shadow-lg">
                        {options.map((ayStart) => {
                            const isActive = ayStart === value;
                            return (
                                <button
                                    type="button"
                                    key={ayStart}
                                    onClick={() => {
                                        onChange(ayStart);
                                        setIsOpen(false);
                                    }}
                                    className={clsx(
                                        'font-space flex cursor-pointer justify-center border-b border-slate-100 p-1.5 text-[11px] font-bold tracking-wide last:border-b-0',
                                        isActive
                                            ? 'bg-theme-blue/10 text-theme-blue'
                                            : 'text-slate-600 hover:bg-slate-50',
                                    )}
                                >
                                    {formatAYLabel(ayStart)}
                                </button>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}

export default YearPickerPopover;
