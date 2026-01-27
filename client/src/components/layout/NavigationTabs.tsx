import clsx from 'clsx';

interface NavigationTabsProps {
    activeTab: 'catalog' | 'calendar';
    totalResults: number;
    setActiveTab: (tab: 'catalog' | 'calendar') => void;
}

function NavigationTabs({ activeTab, totalResults, setActiveTab }: NavigationTabsProps) {
    const getTabStyles = (tab: 'catalog' | 'calendar') => {
        const isActive = activeTab === tab;
        return clsx(
            'flex items-center h-full gap-3 px-10 text-[11px] font-black uppercase tracking-[0.15em] border-t-2 border-x-2 rounded-t-2xl cursor-pointer transition-all',
            isActive
                ? 'border-gray-200 translate-y-px bg-white'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100/70 border-transparent bg-transparent',
        );
    };
    return (
        <nav className="w-full border-b border-gray-100 bg-gray-50 px-10 pt-6" role="tablist">
            <div className="flex h-12 items-end gap-1">
                <button
                    type="button"
                    role="tab"
                    onClick={() => setActiveTab('catalog')}
                    className={getTabStyles('catalog')}
                >
                    Catalog
                    <span
                        className={clsx(
                            'rounded-2xl px-2 py-0.5 text-[9px] font-black transition-colors',
                            activeTab === 'catalog'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-400',
                        )}
                    >
                        {totalResults.toLocaleString()}
                    </span>
                </button>
                <button
                    type="button"
                    role="tab"
                    onClick={() => setActiveTab('calendar')}
                    className={getTabStyles('calendar')}
                >
                    Calendar
                </button>
            </div>
        </nav>
    );
}

export default NavigationTabs;
