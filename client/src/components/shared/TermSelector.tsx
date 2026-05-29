import clsx from 'clsx';
import React from 'react';
import { Calendar } from 'lucide-react';
import YearPickerPopover from './YearPickerPopover';
import { formatAYLabel } from '../../utils/academicYear';
import type { AcademicTerm } from '../../types';

interface TermSelectorProps {
    yearOptions?: number[];
    academicYear: number;
    selectedTerm: AcademicTerm | null;
    availableTerms: readonly AcademicTerm[];
    onYearChange?: (ayStart: number) => void;
    onChangeTerm: (term: AcademicTerm) => void;
}

function TermSelector({
    yearOptions,
    academicYear,
    selectedTerm,
    availableTerms,
    onYearChange,
    onChangeTerm,
}: TermSelectorProps) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <span className="bg-theme-blue/10 text-theme-blue flex h-6 w-6 items-center justify-center rounded-md">
                        <Calendar size={13} />
                    </span>
                    <span className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">
                        Academic Term
                    </span>
                </div>
                {yearOptions && onYearChange ? (
                    <YearPickerPopover
                        value={academicYear}
                        options={yearOptions}
                        onChange={onYearChange}
                    />
                ) : (
                    <span className="font-space rounded-md bg-slate-100 px-2 py-1 text-[11px] font-bold tracking-wide text-slate-500">
                        {formatAYLabel(academicYear)}
                    </span>
                )}
            </div>
            <div className="grid grid-cols-2 gap-1.5">
                {availableTerms.map((term) => (
                    <button
                        type="button"
                        key={term}
                        onClick={() => onChangeTerm(term)}
                        className={clsx(
                            'cursor-pointer rounded-lg border-2 py-2 text-[12px] font-medium transition-all',
                            selectedTerm === term
                                ? 'bg-theme-blue border-theme-blue text-white'
                                : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300',
                        )}
                    >
                        {term}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default React.memo(TermSelector);
