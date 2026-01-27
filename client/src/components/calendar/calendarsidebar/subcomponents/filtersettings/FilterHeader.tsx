import clsx from 'clsx';
import { ChevronDown, Settings2 } from 'lucide-react';
import type { AcademicTerm } from '../../../../../constants';

interface FilterHeaderProps {
    isOpen: boolean;
    selectedTerm: AcademicTerm;
    onToggle: () => void;
}

function FilterHeader({ isOpen, onToggle, selectedTerm }: FilterHeaderProps) {
    return (
        <button
            onClick={onToggle}
            className="flex items-center justify-between w-full p-5 cursor-pointer hover:bg-gray-100/60"
        >
            <div className="flex items-center gap-3">
                <div className="text-white p-2 rounded-lg bg-theme-blue shadow-md shadow-blue-100">
                    <Settings2 size={18} />
                </div>
                <div className="flex flex-col items-start">
                    <span className="text-[13px] font-bold">Schedule Options</span>
                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
                        {selectedTerm}
                    </span>
                </div>
            </div>
            <ChevronDown
                size={18}
                className={clsx(
                    'text-gray-400 transition-transform duration-200 ease-in-out',
                    isOpen && '-rotate-180',
                )}
            />
        </button>
    );
}

export default FilterHeader;
