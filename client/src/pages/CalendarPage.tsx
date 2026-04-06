import { PanelRight } from 'lucide-react';
import WeeklyCalendar from '../components/calendar/WeeklyCalendar';
import ScheduleFeedback from '../components/calendar/ScheduleFeedback';
import type { AppController } from '../hooks/useAppController';

interface CalendarPageProps {
    data: AppController['data'];
    state: AppController['state'];
    actions: AppController['actions'];
}

function CalendarPage({ data, state, actions }: CalendarPageProps) {
    const pinnedCount = state.pinnedCourses.size;

    return (
        <div className="relative flex-1 overflow-hidden bg-white">
            <WeeklyCalendar
                showWeekend={state.showWeekend}
                selectedTerm={state.calendarSidebar.selectedTerm}
                selectedSections={state.selectedSections}
                sectionsByCourseId={data.sectionsByCourseId}
                onSectionSwap={actions.handleSectionSelect}
            />
            {state.calendarSidebar.scheduleFeedback && (
                <ScheduleFeedback
                    onFix={actions.calendarSidebar.handleApplyFix}
                    onDismiss={actions.calendarSidebar.handleDismissFeedback}
                    diagnostics={state.calendarSidebar.scheduleFeedback}
                />
            )}
            <button
                type="button"
                onClick={() => actions.setIsPanelOpen(true)}
                className="bg-theme-blue absolute right-6 bottom-6 z-30 flex h-12 w-14 cursor-pointer items-center justify-center rounded-xl text-white shadow-xl transition-all hover:scale-105 hover:shadow-2xl active:scale-95 xl:hidden"
            >
                <PanelRight size={22} />
                {pinnedCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm">
                        {pinnedCount}
                    </span>
                )}
            </button>
        </div>
    );
}

export default CalendarPage;
