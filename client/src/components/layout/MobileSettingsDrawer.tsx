import { Settings2, X } from 'lucide-react';
import CalendarSidebar from '../calendar/calendarsidebar/CalendarSidebar';
import type { AppController } from '../../hooks/useAppController';

interface MobileSettingsDrawerProps {
    data: AppController['data'];
    state: AppController['state'];
    actions: AppController['actions'];
    refs: AppController['refs'];
}

export default function MobileSettingsDrawer({
    data,
    state,
    actions,
    refs,
}: MobileSettingsDrawerProps) {
    // Requirements: Completely gone if not calendar or not open
    if (!state.isPanelOpen || state.activeTab !== 'calendar') return null;

    return (
        <div className="fixed inset-0 z-50 2xl:hidden">
            {/* Backdrop: Slightly darkens the screen */}
            <div
                className="animate-in fade-in absolute inset-0 bg-black/20 backdrop-blur-[2px] duration-300"
                onClick={() => actions.setIsPanelOpen(false)}
            />

            {/* Drawer Panel: Slides in from the right */}
            <div className="animate-in slide-in-from-right absolute top-0 right-0 flex h-full w-80 flex-col border-l border-gray-200 bg-white shadow-2xl duration-300">
                <div className="flex items-center justify-between border-b border-gray-100 bg-white p-4">
                    <div className="flex items-center gap-2">
                        <Settings2 size={16} className="text-theme-blue" />
                        <span className="text-[10px] font-black tracking-widest text-gray-900 uppercase">
                            Settings
                        </span>
                    </div>
                    <button
                        onClick={() => actions.setIsPanelOpen(false)}
                        className="rounded-full bg-gray-50 p-2 transition-colors hover:bg-gray-100"
                    >
                        <X size={18} className="text-gray-500" />
                    </button>
                </div>

                {/* Reuse the Sidebar component */}
                <div className="flex-1 overflow-y-auto">
                    <CalendarSidebar
                        courses={data.courses}
                        showWeekend={state.showWeekend}
                        pinnedCourses={state.pinnedCourses}
                        selectedSections={state.selectedSections}
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
