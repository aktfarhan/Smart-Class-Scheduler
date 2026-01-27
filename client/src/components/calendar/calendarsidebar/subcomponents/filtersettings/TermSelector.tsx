import clsx from 'clsx';
import { Calendar } from 'lucide-react';
import type { AcademicTerm } from '../../../../../constants';

interface TermSelectorProps {
    selectedTerm: AcademicTerm | null;
    availableTerms: readonly AcademicTerm[];
    onChangeTerm: (term: AcademicTerm) => void;
}

function TermSelector({ selectedTerm, availableTerms, onChangeTerm }: TermSelectorProps) {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase">
                <Calendar size={12} /> Academic Term
            </div>
            <div className="grid grid-cols-2 gap-1.5">
                {availableTerms.map((term) => (
                    <button
                        key={term}
                        onClick={() => onChangeTerm(term)}
                        className={clsx(
                            'cursor-pointer rounded-lg border-2 py-2 text-[12px] font-semibold transition-all',
                            selectedTerm === term
                                ? 'text-theme-blue border-theme-blue bg-theme-blue/5'
                                : 'border-gray-100 text-gray-400 hover:border-gray-200',
                        )}
                    >
                        {term}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default TermSelector;
