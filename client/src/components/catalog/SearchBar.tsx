import { useMemo, useState } from 'react';
import SearchToken from './SearchToken';
import SearchHelp from './SearchHelp';
import { Search, X, HelpCircle } from 'lucide-react';
import type { LookupData } from '../../types';
import { parseSearchInput } from '../../filters/parseSearchInput';

interface SearchBarProps {
    lookupData: LookupData;
    searchQuery: string;
    setSearchQuery: (search: string) => void;
}

function SearchBar({ lookupData, searchQuery, setSearchQuery }: SearchBarProps) {
    const [showHelp, setShowHelp] = useState(false);

    const { tokens } = useMemo(() => {
        return parseSearchInput(searchQuery, lookupData);
    }, [searchQuery, lookupData]);

    return (
        <div className="relative mx-4 mb-4 max-w-7xl sm:mx-10">
            <div className="group relative w-full">
                <Search
                    size={20}
                    className="group-focus-within:text-theme-blue absolute top-1/2 left-5 -translate-y-1/2 text-slate-400 transition-colors"
                />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search departments, courses, instructors, terms..."
                    className="focus:border-theme-blue h-14 w-full rounded-xl border-2 border-gray-200 bg-white px-14 text-base font-medium text-slate-900 shadow-xs transition-all outline-none focus:ring-4 focus:ring-blue-500/5"
                    spellCheck={false}
                />
                {searchQuery ? (
                    <button
                        key="clear"
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute top-1/2 right-5 -translate-y-1/2 cursor-pointer rounded-lg bg-gray-100 p-1.5 text-slate-400 transition-all hover:bg-gray-200 hover:text-slate-600 active:scale-90"
                    >
                        <X size={14} strokeWidth={2.5} />
                    </button>
                ) : (
                    <button
                        key="help"
                        type="button"
                        onClick={() => setShowHelp(true)}
                        onMouseDown={(e) => e.preventDefault()}
                        className="absolute top-1/2 right-5 -translate-y-1/2 cursor-pointer text-slate-300 transition-all hover:text-slate-500"
                    >
                        <HelpCircle size={20} />
                    </button>
                )}
            </div>
            {searchQuery && (
                <div className="mt-3 flex flex-wrap gap-2 px-2">
                    {tokens.map((token, i) => (
                        <SearchToken key={`${token.type}-${token.text}-${i}`} token={token} />
                    ))}
                </div>
            )}
            {showHelp && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-black/5"
                        onClick={() => setShowHelp(false)}
                    />
                    <div className="absolute right-0 z-50 mt-2">
                        <SearchHelp onClose={() => setShowHelp(false)} />
                    </div>
                </>
            )}
        </div>
    );
}

export default SearchBar;
