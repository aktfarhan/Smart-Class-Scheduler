import clsx from 'clsx';
import { ChevronDown, Settings2 } from 'lucide-react';
import type { AcademicTerm } from '../../../../types';

interface FilterHeaderProps {
    isOpen: boolean;
    selectedTerm: AcademicTerm;
    onToggle: () => void;
}

function FilterHeader({ isOpen, onToggle, selectedTerm }: FilterHeaderProps) {
    return (
        <button
            type="button"
            onClick={onToggle}
            className="flex w-full cursor-pointer items-center justify-between p-5 hover:bg-gray-100/60"
        >
            <div className="flex items-center gap-3">
                <div className="bg-theme-blue flex h-9 w-9 items-center justify-center rounded-lg text-white shadow-sm">
                    <Settings2 size={16} />
                </div>
                <div className="flex flex-col items-start">
                    <span className="text-[13px] font-bold text-slate-800">Schedule Options</span>
                    <span className="text-[10px] font-medium tracking-widest text-slate-400 uppercase">
                        {selectedTerm}
                    </span>
                </div>
            </div>
            <ChevronDown
                size={18}
                className={clsx(
                    'text-slate-400 transition-transform duration-200 ease-in-out',
                    isOpen && '-rotate-180',
                )}
            />
        </button>
    );
}

export default FilterHeader;
