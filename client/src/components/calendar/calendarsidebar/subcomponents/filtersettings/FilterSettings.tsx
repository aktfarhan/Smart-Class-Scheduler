import FilterHeader from './FilterHeader';
import MinGapSlider from './MinGapSlider';
import TermSelector from './TermSelector';
import Separator from '../../../../Separator';
import TimeRangeSlider from './TimeRangeSlider';
import ActiveDaysSelector from './ActiveDaysSelector';
import type { TimeRange } from '../../../../../types';
import type { Dispatch, RefObject, SetStateAction } from 'react';
import type { AcademicTerm, DayLiteral } from '../../../../../constants';

interface FilterState {
    isFilterOpen: boolean;
    selectedTerm: AcademicTerm;
    selectedDays: DayLiteral[];
    minGap: number;
    timeRange: TimeRange;
}

interface FilterActions {
    setIsFilterOpen: Dispatch<SetStateAction<boolean>>;
    handleTermChange: (term: AcademicTerm) => void;
    toggleDay: (day: DayLiteral) => void;
    setMinGap: Dispatch<SetStateAction<number>>;
    onPointerDown: (thumb: 'start' | 'end') => (e: React.PointerEvent) => void;
}

interface FilterSettingsProps {
    filterState: FilterState;
    filterActions: FilterActions;
    days: DayLiteral[];
    sliderRef: RefObject<HTMLDivElement | null>;
    SLIDER_MIN: number;
    SLIDER_MAX: number;
    availableTerms: readonly AcademicTerm[];
    gapPresets: readonly number[];
    maxGap: number;
}

function FilterSettings({
    filterState,
    filterActions,
    days,
    sliderRef,
    SLIDER_MIN,
    SLIDER_MAX,
    availableTerms,
    gapPresets,
    maxGap,
}: FilterSettingsProps) {
    return (
        <div className="border-b border-gray-100 bg-gray-50/50">
            <FilterHeader
                isOpen={filterState.isFilterOpen}
                onToggle={() => filterActions.setIsFilterOpen(!filterState.isFilterOpen)}
                selectedTerm={filterState.selectedTerm}
            />
            {filterState.isFilterOpen && (
                <div className="px-6 pb-6 space-y-6 mt-1 animate-in fade-in slide-in-from-top-2">
                    <TermSelector
                        availableTerms={availableTerms}
                        selectedTerm={filterState.selectedTerm}
                        onChangeTerm={filterActions.handleTermChange}
                    />
                    <Separator />
                    <ActiveDaysSelector
                        days={days}
                        selectedDays={filterState.selectedDays}
                        toggleDay={filterActions.toggleDay}
                    />
                    <Separator />
                    <TimeRangeSlider
                        timeRange={filterState.timeRange}
                        sliderRef={sliderRef}
                        min={SLIDER_MIN}
                        max={SLIDER_MAX}
                        onPointerDown={filterActions.onPointerDown}
                    />
                    <MinGapSlider
                        minGap={filterState.minGap}
                        maxGap={maxGap}
                        setMinGap={filterActions.setMinGap}
                        gapPresets={gapPresets}
                    />
                </div>
            )}
        </div>
    );
}

export default FilterSettings;
