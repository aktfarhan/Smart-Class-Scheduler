import clsx from 'clsx';
import { BookOpen } from 'lucide-react';
import type { SectionType } from '../../../types';

interface SectionTypeSelectorProps {
    types: readonly string[];
    selectedType: SectionType | undefined | null;
    searchQuery: string;
    onSelect: (type: string) => void;
}

function SectionTypeSelector({
    types,
    selectedType,
    searchQuery,
    onSelect,
}: SectionTypeSelectorProps) {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase">
                <BookOpen size={12} /> Type
            </div>
            <div className="grid grid-cols-2 gap-1.5">
                {types.map((type) => {
                    const isSelected =
                        selectedType === type.toUpperCase() ||
                        searchQuery?.toLowerCase().includes(type.toLowerCase());

                    return (
                        <button
                            key={type}
                            onClick={() => onSelect(type)}
                            className={clsx(
                                'cursor-pointer rounded-lg border-2 py-2 text-[12px] font-semibold transition-all',
                                isSelected
                                    ? 'text-theme-blue border-theme-blue bg-theme-blue/5'
                                    : 'border-gray-100 text-gray-400 hover:border-gray-200',
                            )}
                        >
                            {type}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default SectionTypeSelector;
