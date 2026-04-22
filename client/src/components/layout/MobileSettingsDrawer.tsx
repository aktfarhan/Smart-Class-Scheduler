import CalendarSidebar from '../calendar/calendarsidebar/CalendarSidebar';
import type { AppController } from '../../hooks/useAppController';

interface MobileSettingsDrawerProps {
    data: AppController['data'];
    state: AppController['state'];
    actions: AppController['actions'];
    refs: AppController['refs'];
}

function MobileSettingsDrawer({ data, state, actions, refs }: MobileSettingsDrawerProps) {
    if (!state.isPanelOpen || state.activeTab !== 'calendar') return null;

    return (
        <div className="fixed inset-0 z-50 xl:hidden">
            <div
                className="animate-in fade-in absolute inset-0 bg-black/20 backdrop-blur-[2px] duration-300"
                onClick={() => actions.setIsPanelOpen(false)}
            />
            <div className="animate-in slide-in-from-right absolute top-0 right-0 flex h-full w-80 flex-col border-l border-gray-200 bg-white shadow-2xl duration-300">
                <div className="relative flex-1 overflow-y-auto">
                    <CalendarSidebar
                        courses={data.courses}
                        showWeekend={state.showWeekend}
                        pinnedCourses={state.pinnedCourses}
                        selectedSections={state.selectedSections}
                        hasWeekendSections={state.hasWeekendSections}
                        sectionsByCourseId={data.sectionsByCourseId}
                        setShowWeekend={actions.setShowWeekend}
                        setSelectedSections={actions.setSelectedSections}
                        handleSectionSelect={actions.handleSectionSelect}
                        sidebar={{
                            state: state.calendarSidebar,
                            actions: actions.calendarSidebar,
                            data: data.calendarSidebar,
                            refs: refs.calendarSidebar,
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

export default MobileSettingsDrawer;
