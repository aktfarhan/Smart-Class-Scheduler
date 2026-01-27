import clsx from 'clsx';
import { User, Copy, Check } from 'lucide-react';
import type { ApiInstructor } from '../../../types';

interface SectionInstructorsProps {
    copiedId: string | null;
    instructors: ApiInstructor[];
    onCopy: (email: string | null | undefined, id: string) => void;
}

function SectionInstructors({ instructors, copiedId, onCopy }: SectionInstructorsProps) {
    return (
        <div className="flex flex-row lg:flex-col items-start lg:items-center lg:justify-center gap-2">
            <span className="lg:hidden w-24 mt-1 shrink-0 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Instructors
            </span>
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2 min-w-0">
                {instructors.map((i, idx) => {
                    const instructorId = `${i.id}` || `${i.firstName}-${i.lastName}-${idx}`;
                    const hasEmail = Boolean(i.email);
                    return (
                        <div
                            key={instructorId}
                            className="flex items-center relative gap-x-1 group/inst"
                        >
                            <User
                                size={14}
                                className={clsx(
                                    'text-gray-400 shrink-0',
                                    hasEmail && 'group-hover/inst:text-theme-blue cursor-pointer',
                                )}
                            />
                            <span
                                className={clsx(
                                    'text-xs font-semibold text-gray-700 transition-all',
                                    hasEmail &&
                                        'cursor-pointer hover:text-theme-blue border-b border-transparent hover:border-theme-blue/30',
                                )}
                            >
                                {i.firstName} {i.lastName}
                            </span>
                            {hasEmail && (
                                <div className="flex items-center gap-3 absolute bottom-full left-1/2 -translate-x-1/2 z-50 mb-2.5 p-2 rounded-xl bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl opacity-0 invisible pointer-events-none translate-y-1.5 transition-all duration-300 group-hover/inst:opacity-100 group-hover/inst:visible group-hover/inst:pointer-events-auto group-hover/inst:translate-y-0">
                                    <span className="ml-1 text-[12px] text-gray-800 whitespace-nowrap">
                                        {i.email}
                                    </span>
                                    <button
                                        onClick={() => onCopy(i.email, instructorId)}
                                        className="flex items-center justify-center cursor-pointer p-1.5 rounded-lg bg-theme-blue text-white shadow-md shadow-theme-blue/20 transition-all hover:scale-105 active:scale-95"
                                    >
                                        {copiedId === instructorId ? (
                                            <Check size={14} />
                                        ) : (
                                            <Copy size={14} />
                                        )}
                                    </button>
                                    <div className="absolute top-full left-1/2 border-7 border-transparent border-t-white/95 -translate-x-1/2"></div>
                                </div>
                            )}
                            {idx < instructors.length - 1 && (
                                <span className="text-gray-600 text-lg">,</span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default SectionInstructors;
