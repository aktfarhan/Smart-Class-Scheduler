import { useMemo } from 'react';
import SearchToken from './SearchToken';
import { Search, X } from 'lucide-react';
import { parseSearchInput } from '../../filters/parseSearchInput';
import type { LookupData, Token } from '../../types';

interface SearchBarProps {
    lookupData: LookupData;
    searchQuery: string;
    setSearchQuery: (search: string) => void;
}

function SearchBar({ lookupData, searchQuery, setSearchQuery }: SearchBarProps) {
    const { tokens }: { tokens: Token[] } = useMemo(() => {
        return parseSearchInput(searchQuery, lookupData);
    }, [searchQuery, lookupData]);

    return (
        <div className="mx-4 mb-4 max-w-7xl sm:mx-10">
            <div className="group relative w-full">
                <Search
                    size={20}
                    className="group-focus-within:text-theme-blue absolute top-1/2 left-5 -translate-y-1/2 text-gray-400 transition-colors"
                />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search courses (e.g. Spring 2026, CS110, TuTh)..."
                    className="focus:border-theme-blue h-14 w-full rounded-xl border-2 border-gray-200 bg-white px-14 text-base font-medium text-gray-900 shadow-xs transition-all outline-none focus:ring-4 focus:ring-blue-500/5"
                    spellCheck={false}
                />
                {searchQuery && (
                    <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute top-1/2 right-6 -translate-y-1/2 cursor-pointer text-gray-400 transition-colors hover:text-gray-600"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>
            {searchQuery && (
                <div className="mt-3 flex flex-wrap gap-2 px-2">
                    {tokens.map((token, i) => (
                        <SearchToken key={i} token={token} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default SearchBar;
