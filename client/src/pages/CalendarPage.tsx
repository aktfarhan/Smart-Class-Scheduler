import clsx from 'clsx';
import { Sparkles, PanelRightOpen } from 'lucide-react';
import WeeklyCalendar from '../components/calendar/WeeklyCalendar';
import type { AppController } from '../hooks/useAppController';

interface CatalogPageProps {
    data: AppController['data'];
    state: AppController['state'];
    actions: AppController['actions'];
    schedule: () => void;
}

function CalendarPage({ data, state, actions, schedule }: CatalogPageProps) {
    return (
        <div className="relative flex-1 overflow-hidden bg-white">
            <WeeklyCalendar
                selectedSections={state.selectedSections}
                sectionsByCourseId={data.sectionsByCourseId}
                showWeekend={state.showWeekend}
            />
            <div className="absolute bottom-8 left-1/2 z-40 w-[92%] max-w-70 -translate-x-1/2 sm:max-w-sm 2xl:hidden">
                <div className="flex items-center gap-1 rounded-xl border border-white/20 bg-white/80 p-1 shadow-2xl ring-1 ring-black/5 backdrop-blur-2xl">
                    <button
                        disabled={state.pinnedCourses.size === 0}
                        onClick={schedule}
                        className={clsx(
                            'flex h-12 flex-1 cursor-pointer items-center justify-center gap-3 rounded-xl text-[11px] font-black tracking-widest uppercase transition-all',
                            state.pinnedCourses.size > 0
                                ? 'from-theme-blue bg-linear-to-r to-cyan-500 text-white shadow-lg active:scale-95'
                                : 'cursor-not-allowed bg-gray-100 text-gray-300',
                        )}
                    >
                        <Sparkles size={16} />
                        {state.isGenerating ? 'Analyzing...' : 'Generate Schedule'}
                    </button>
                    <button
                        onClick={() => actions.setIsPanelOpen(true)}
                        className="bg-theme-blue flex h-12 w-14 cursor-pointer items-center justify-center rounded-xl text-white shadow-lg transition-all active:rotate-12"
                    >
                        <PanelRightOpen size={22} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CalendarPage;
