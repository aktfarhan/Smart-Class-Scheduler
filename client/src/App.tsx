import { useAppController } from './hooks/useAppController';
import CatalogPage from './pages/CatalogPage';
import CalendarPage from './pages/CalendarPage';
import FilterSidebar from './components/catalog/filtersettings/FilterSidebar';
import CalendarSidebar from './components/calendar/calendarsidebar/CalendarSidebar';
import NavigationTabs from './components/layout/NavigationTabs';
import MobileSettingsDrawer from './components/layout/MobileSettingsDrawer';

export default function App() {
    const { data, state, refs, actions } = useAppController();

    return (
        <main className="relative flex h-screen w-full justify-center overflow-hidden bg-gray-50 antialiased">
            {state.isPanelOpen && (
                <MobileSettingsDrawer data={data} state={state} actions={actions} refs={refs} />
            )}

            <div className="flex h-full w-full">
                <aside className="hidden w-80 shrink-0 flex-col border-r border-gray-200 bg-white 2xl:flex">
                    <div className="border-b border-gray-100 bg-gray-50/30 p-8">
                        <div className="flex items-center gap-3">
                            <div className="bg-theme-blue flex h-10 w-10 items-center justify-center rounded-xl text-xl font-black text-white shadow-lg shadow-blue-100">
                                U
                            </div>
                            <h1 className="text-xl font-black tracking-tighter text-gray-900">
                                UMB CATALOG
                            </h1>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {state.activeTab === 'catalog' ? (
                            <FilterSidebar
                                filters={data.activeFilters}
                                searchQuery={state.searchQuery}
                                departmentMap={data.lookupData.departmentMap}
                                onFilterChange={actions.handleSidebarFilter}
                            />
                        ) : (
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
                        )}
                    </div>
                </aside>
                <div className="relative flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-white">
                    <NavigationTabs
                        activeTab={state.activeTab}
                        setActiveTab={actions.setActiveTab}
                        totalResults={state.totalResults}
                    />

                    <div className="relative flex flex-1 flex-col overflow-hidden">
                        {state.activeTab === 'catalog' ? (
                            <CatalogPage data={data} state={state} refs={refs} actions={actions} />
                        ) : (
                            <CalendarPage data={data} state={state} actions={actions} schedule={actions.calendarSidebar.handleGenerateSchedule} />
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
