import { RotateCcw } from 'lucide-react';
import TimeSelector from './TimeSelector';
import { useCallback, useMemo } from 'react';
import Separator from '../../shared/Separator';
import DataUpdateTimer from './DataUpdateTimer';
import TermSelector from '../../shared/TermSelector';
import DepartmentSelector from './DepartmentSelector';
import { FILTER_CATEGORIES } from '../../../constants';
import SectionTypeSelector from './SectionTypeSelector';
import { getTermsForAY } from '../../../utils/academicYear';
import ActiveDaysSelector from '../../shared/ActiveDaysSelector';
import type { AcademicTerm, LookupData, SearchFilters, FilterType } from '../../../types';

interface FilterSidebarProps {
    filters: SearchFilters;
    isLoading: boolean;
    lastUpdatedAt: string | null;
    lookupData: LookupData;
    academicYear: number;
    onAcademicYearChange: (ayStart: number) => void;
    onFilterChange: (type: FilterType, value: string) => void;
}

function FilterSidebar({
    filters,
    isLoading,
    lastUpdatedAt,
    lookupData,
    academicYear,
    onAcademicYearChange,
    onFilterChange,
}: FilterSidebarProps) {
    const availableTerms = useMemo(() => getTermsForAY(academicYear), [academicYear]);
    const handleTermClick = useCallback(
        (term: AcademicTerm) => onFilterChange('term', term),
        [onFilterChange],
    );

    return (
        <div className="flex h-full flex-col bg-white select-none">
            <div className="scrollbar-hidden flex-1 space-y-5 overflow-y-auto p-6">
                <TermSelector
                    academicYear={academicYear}
                    yearOptions={lookupData.academicYears}
                    onYearChange={onAcademicYearChange}
                    selectedTerm={filters.term ?? null}
                    availableTerms={availableTerms}
                    onChangeTerm={handleTermClick}
                />
                <ActiveDaysSelector
                    days={[...FILTER_CATEGORIES.DAYS]}
                    selectedDays={filters.days}
                    toggleDay={(day) => onFilterChange('day', day)}
                />
                <TimeSelector
                    times={[...FILTER_CATEGORIES.TIMES]}
                    selectedTime={filters.timeRange}
                    onSelect={(time) => onFilterChange('timeRange', time)}
                />
                <SectionTypeSelector
                    types={[...FILTER_CATEGORIES.TYPES]}
                    selectedType={filters.sectionType}
                    onSelect={(type) => onFilterChange('sectionType', type)}
                />
                <Separator />
                <DepartmentSelector
                    isLoading={isLoading}
                    departmentMap={lookupData.departmentMap}
                    selectedDeptCode={filters.departmentCode}
                    onSelect={(code) => onFilterChange('departmentCode', code)}
                />
            </div>
            <div className="relative p-5">
                <div className="absolute top-0 right-0 left-0 h-px bg-linear-to-r from-transparent via-slate-200 to-transparent" />
                <button
                    type="button"
                    onClick={() => onFilterChange('clear', '')}
                    className="group flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-slate-200 bg-slate-50 py-2.5 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase transition-all hover:bg-slate-100 hover:text-slate-500 active:scale-[0.97]"
                >
                    <RotateCcw
                        size={13}
                        strokeWidth={2.5}
                        className="transition-transform duration-500 group-hover:-rotate-180"
                    />
                    <span>Reset Filters</span>
                </button>
                <div className="mt-3 h-px bg-linear-to-r from-transparent via-slate-200 to-transparent" />
                <DataUpdateTimer lastUpdatedAt={lastUpdatedAt} />
            </div>
        </div>
    );
}

export default FilterSidebar;
