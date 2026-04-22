import clsx from 'clsx';
import { DATA_MAPS } from '../../constants';
import { X, Clock3, CalendarDays, MapPin, User, AlertTriangle } from 'lucide-react';
import type { Block } from '../../types';
import type { CourseColor } from '../../constants';

interface BlockPopoverProps {
    block: Block;
    color: CourseColor;
    position: { top?: string; left?: string; right?: string };
    onClose: () => void;
}

function BlockPopover({ block, color, position, onClose }: BlockPopoverProps) {
    const fullDay = DATA_MAPS.FULL_DAY_MAP[block.day] || block.day;

    return (
        <div
            style={position}
            className="absolute z-50 max-w-70 min-w-50 overflow-hidden rounded-xl border-2 border-slate-200 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
        >
            <div
                className={clsx(
                    'flex items-center justify-between border-b-2 px-4 py-3',
                    color.bg,
                    color.border,
                )}
            >
                <div className="flex items-center gap-2">
                    <p className={clsx('text-sm font-bold', color.text)}>{block.courseCode}</p>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-slate-500 uppercase">
                        {block.sectionNumber}
                    </span>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-all hover:text-slate-600 active:scale-90"
                >
                    <X size={14} strokeWidth={2.5} />
                </button>
            </div>
            <div className="flex flex-col gap-2.5 px-4 py-3 select-text">
                {block.hasConflict && (
                    <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 select-none">
                        <AlertTriangle size={14} />
                        Schedule Conflict
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <CalendarDays size={14} className="shrink-0 text-slate-400" />
                    <span className="text-xs text-slate-600">{fullDay}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock3 size={14} className="shrink-0 text-slate-400" />
                    <span className="text-xs text-slate-600">{block.timeRange}</span>
                </div>
                <div className="flex items-center gap-2">
                    <User size={14} className="shrink-0 text-slate-400" />
                    <span className="text-xs text-slate-600">{block.instructors}</span>
                </div>
                <div className="flex items-center gap-2">
                    <MapPin size={14} className="shrink-0 text-slate-400" />
                    <span className="text-xs text-slate-600">{block.location || 'TBA'}</span>
                </div>
            </div>
        </div>
    );
}

export default BlockPopover;
