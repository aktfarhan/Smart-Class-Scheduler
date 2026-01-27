import React, { useMemo } from 'react';
import { clsx } from 'clsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    jumpValue: string;
    totalPages: number;
    currentPage: number;
    setJumpValue: React.Dispatch<React.SetStateAction<string>>;
    handleJumpPage: (e: React.FormEvent) => void;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

function Pagination({
    jumpValue,
    totalPages,
    currentPage,
    setJumpValue,
    handleJumpPage,
    setCurrentPage,
}: PaginationProps) {
    const paginationRange = useMemo(() => {
        const range: (number | 'dots')[] = [];
        const pages = new Set<number>();
        pages.add(1);
        pages.add(totalPages);
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
            if (i >= 1 && i <= totalPages) {
                pages.add(i);
            }
        }
        const sorted = Array.from(pages).sort((a, b) => a - b);

        for (let i = 0; i < sorted.length; i++) {
            range.push(sorted[i]);

            if (i < sorted.length - 1 && sorted[i + 1] - sorted[i] > 1) {
                range.push('dots');
            }
        }
        return range;
    }, [currentPage, totalPages]);

    return (
        <nav className="w-full border-t border-gray-100 bg-white/10 py-3">
            <div className="flex w-full max-w-340 items-center justify-between px-4 sm:px-10">
                <div className="flex h-11 gap-1.5">
                    <button
                        type="button"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                        className="cursor-pointer rounded-md p-3 text-gray-600 transition-all hover:bg-gray-200 disabled:opacity-30"
                    >
                        <ChevronLeft size={20} strokeWidth={2.5} />
                    </button>
                    <div className="flex items-center gap-1">
                        {paginationRange.map((item, i) =>
                            item === 'dots' ? (
                                <span
                                    key={`dots-${i}`}
                                    className="hidden px-0.5 text-[10px] text-gray-300 sm:inline"
                                >
                                    ...
                                </span>
                            ) : (
                                <button
                                    key={`page-${item}`}
                                    onClick={() => setCurrentPage(item)}
                                    className={clsx(
                                        'h-9 w-9 cursor-pointer rounded-lg text-xs font-bold transition-all',
                                        currentPage === item
                                            ? 'bg-theme-blue text-white'
                                            : 'hover:text-theme-blue text-gray-400 hover:bg-gray-50',
                                    )}
                                >
                                    {item}
                                </button>
                            ),
                        )}
                    </div>
                    <button
                        type="button"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        className="cursor-pointer rounded-md p-3 text-gray-600 transition-all hover:bg-gray-200 disabled:opacity-30"
                    >
                        <ChevronRight size={20} strokeWidth={2.5} />
                    </button>
                </div>
                <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
                    <form onSubmit={handleJumpPage} className="flex items-center gap-2">
                        <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                            Go to
                        </label>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={jumpValue}
                            onChange={(e) => setJumpValue(e.target.value.replace(/\D/g, ''))}
                            placeholder={currentPage.toString()}
                            className="focus:border-theme-blue h-8 w-10 rounded-md border border-gray-200 bg-gray-50 text-center text-xs font-bold text-gray-700 placeholder-gray-300 focus:outline-none"
                        />
                    </form>
                </div>
            </div>
        </nav>
    );
}

export default Pagination;
