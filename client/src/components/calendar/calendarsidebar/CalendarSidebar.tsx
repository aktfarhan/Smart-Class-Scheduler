import clsx from 'clsx';
import PinnedCourseList from './PinnedCourseList';
import { RotateCcw, Sparkles } from 'lucide-react';
import FilterSettings from './filtersettings/FilterSettings';
import ScheduleResults from './scheduleresults/ScheduleResults';
import React, { useMemo, type Dispatch, type SetStateAction } from 'react';
import type { CalendarSidebar as CalendarSidebarType } from './useCalendarSidebar';
import type { ApiCourseWithSections, ApiSectionWithRelations } from '../../../types';

interface CalendarSidebarProps {
    courses: ApiCourseWithSections[];
    showWeekend: boolean;
    academicYear: number;
    pinnedCourses: Set<number>;
    selectedSections: Set<number>;
    hasWeekendSections: boolean;
    sectionsByCourseId: Map<number, ApiSectionWithRelations[]>;
    setShowWeekend: (val: boolean) => void;
    setSelectedSections: Dispatch<SetStateAction<Set<number>>>;
    handleSectionSelect: (courseId: number, sectionId: number) => void;
    sidebar: {
        state: CalendarSidebarType['state'];
        actions: CalendarSidebarType['actions'];
        data: CalendarSidebarType['data'];
        refs: CalendarSidebarType['refs'];
    };
}

function CalendarSidebar({
    courses,
    showWeekend,
    academicYear,
    pinnedCourses,
    selectedSections,
    hasWeekendSections,
    sectionsByCourseId,
    setShowWeekend,
    setSelectedSections,
    handleSectionSelect,
    sidebar,
}: CalendarSidebarProps) {
    const sidebarCourses = useMemo(
        () => courses.filter((course) => pinnedCourses.has(course.id)),
        [courses, pinnedCourses],
    );

    return (
        <div className="flex h-full flex-col overflow-hidden bg-white">
            <div className="flex shrink-0 gap-2 border-b border-gray-100 bg-white p-4">
                <button
                    type="button"
                    disabled={showWeekend && hasWeekendSections}
                    onClick={() => setShowWeekend(!showWeekend)}
                    className={clsx(
                        'flex-1 rounded-lg border-2 py-2.5 text-[10px] font-black tracking-widest uppercase transition-all',
                        showWeekend && hasWeekendSections
                            ? 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300'
                            : showWeekend
                              ? 'bg-theme-blue border-theme-blue cursor-pointer text-white'
                              : 'cursor-pointer border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300',
                    )}
                >
                    {showWeekend ? 'Hide' : 'Show'} Sat/Sun
                </button>
                <button
                    type="button"
                    onClick={() => setSelectedSections(new Set())}
                    className="group flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-slate-200 bg-slate-50 px-4 py-2.5 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase transition-all hover:bg-slate-100 hover:text-slate-500 active:scale-[0.97]"
                >
                    <RotateCcw
                        size={13}
                        strokeWidth={2.5}
                        className="transition-transform duration-500 group-hover:-rotate-180"
                    />
                    <span>Clear</span>
                </button>
            </div>
            <div className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto bg-white">
                <FilterSettings
                    filterState={{
                        isFilterOpen: sidebar.state.isFilterOpen,
                        selectedTerm: sidebar.state.selectedTerm,
                        selectedDays: sidebar.state.selectedDays,
                        minGap: sidebar.state.minimumGap,
                        timeRange: sidebar.state.timeRange,
                    }}
                    filterActions={{
                        setIsFilterOpen: sidebar.actions.setIsFilterOpen,
                        handleTermChange: sidebar.actions.handleTermChange,
                        toggleDay: sidebar.actions.toggleDay,
                        setMinGap: sidebar.actions.setMinimumGap,
                        onPointerDown: sidebar.actions.onPointerDown,
                        onPointerMove: sidebar.actions.onPointerMove,
                        onPointerUp: sidebar.actions.onPointerUp,
                    }}
                    days={sidebar.state.daysList}
                    sliderRef={sidebar.refs.sliderRef}
                    SLIDER_MIN={sidebar.state.sliderMin}
                    SLIDER_MAX={sidebar.state.sliderMax}
                    academicYear={academicYear}
                    gapPresets={sidebar.data.gapPresets}
                    maxGap={sidebar.data.maxGap}
                />
                <PinnedCourseList
                    expandedId={sidebar.state.expandedId}
                    selectedTerm={sidebar.state.selectedTerm}
                    selectedSections={selectedSections}
                    pinnedCourses={sidebarCourses}
                    sectionsByCourseId={sectionsByCourseId}
                    setExpandedId={sidebar.actions.setExpandedId}
                    onSectionSelect={handleSectionSelect}
                    isCoursesOpen={sidebar.state.isCoursesOpen}
                    setIsCoursesOpen={sidebar.actions.setIsCoursesOpen}
                />
                {sidebar.data.hasGeneratedOnce && (
                    <ScheduleResults
                        sortPreset={sidebar.state.sortPreset}
                        rankedSchedules={sidebar.data.rankedSchedules}
                        selectedResultIndex={sidebar.state.selectedResultIndex}
                        totalScoredSchedules={sidebar.data.totalScoredSchedules}
                        onSortChange={sidebar.actions.handleSortChange}
                        onResultHover={sidebar.actions.handleResultHover}
                        onResultSelect={sidebar.actions.handleResultSelect}
                    />
                )}
            </div>
            <div className="shrink-0 border-t border-gray-100 bg-white p-5">
                <button
                    type="button"
                    disabled={pinnedCourses.size === 0}
                    onClick={sidebar.actions.handleGenerateSchedule}
                    className={clsx(
                        'flex h-12 w-full items-center justify-center gap-3 rounded-xl text-[11px] font-black tracking-widest uppercase transition-all',
                        pinnedCourses.size > 0
                            ? 'from-theme-blue to-theme-blue/70 cursor-pointer bg-linear-to-r text-white shadow-lg active:scale-95'
                            : 'cursor-not-allowed bg-gray-100 text-slate-300',
                    )}
                >
                    <Sparkles size={16} />
                    Generate Schedule
                </button>
            </div>
        </div>
    );
}

export default React.memo(CalendarSidebar);
