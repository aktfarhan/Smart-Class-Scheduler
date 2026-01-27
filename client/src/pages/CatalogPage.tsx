import SearchBar from '../components/catalog/SearchBar';
import CourseList from '../components/catalog/course/CourseList';
import Pagination from '../components/catalog/Pagination';
import type { AppController } from '../hooks/useAppController';

interface CatalogPageProps {
    data: AppController['data'];
    state: AppController['state'];
    refs: AppController['refs'];
    actions: AppController['actions'];
}

function CatalogPage({ data, state, refs, actions }: CatalogPageProps) {
    return (
        <div className="flex flex-1 flex-col overflow-hidden">
            <div className="border-b border-gray-50 bg-white pt-6">
                <SearchBar
                    lookupData={data.lookupData}
                    searchQuery={state.searchQuery}
                    setSearchQuery={actions.setSearchQuery}
                />
            </div>
            <div ref={refs.scrollContainerRef} className="flex-1 overflow-y-auto pb-4">
                <CourseList
                    pagedCourses={data.pagedCourses}
                    activeFilters={data.activeFilters}
                    pinnedCourses={state.pinnedCourses}
                    setPinnedCourses={actions.setPinnedCourses}
                    expandedCourseIds={state.expandedCourseIds}
                    sectionsByCourseId={data.sectionsByCourseId}
                    setExpandedCourseIds={actions.setExpandedCourseIds}
                />
            </div>
            <Pagination
                jumpValue={state.jumpValue}
                totalPages={state.totalPages}
                currentPage={state.currentPage}
                setJumpValue={actions.setJumpValue}
                setCurrentPage={actions.setCurrentPage}
                handleJumpPage={actions.handleJumpPage}
            />
        </div>
    );
}

export default CatalogPage;
