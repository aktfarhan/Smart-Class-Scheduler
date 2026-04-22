import clsx from 'clsx';
import React from 'react';
import type { CourseColor } from '../../constants';

interface GhostBlockProps {
    top: number;
    color: CourseColor;
    height: number;
    timeRange: string;
    isHovered: boolean;
    columnIndex: number;
    hasConflict: boolean;
    totalColumns: number;
    sectionNumber: string;
}

function GhostBlock({
    top,
    color,
    height,
    timeRange,
    isHovered,
    columnIndex,
    hasConflict,
    totalColumns,
    sectionNumber,
}: GhostBlockProps) {
    // Side-by-side positioning
    const colWidth = 100 / totalColumns;
    const leftPercent = columnIndex * colWidth;

    return (
        <div
            style={{
                top: `${top}%`,
                height: `${height}%`,
                left: `calc(${leftPercent}% + 4px)`,
                width: `calc(${colWidth}% - 8px)`,
            }}
            className={clsx(
                'absolute z-20 rounded-xl border-2 p-2',
                isHovered
                    ? hasConflict
                        ? `border-l-6 border-solid border-red-400 ${color.bg} opacity-80 shadow-md shadow-red-200/50`
                        : `border-l-6 border-solid ${color.border} ${color.bg} opacity-80 shadow-md`
                    : hasConflict
                      ? `border-dashed border-red-300 ${color.bg} opacity-35`
                      : `border-dashed ${color.border} ${color.bg} opacity-50`,
            )}
        >
            <p
                className={clsx(
                    'truncate text-[10px] font-bold',
                    hasConflict ? 'text-red-500' : color.text,
                )}
            >
                {sectionNumber}
            </p>
            <p className="truncate text-[9px] text-slate-500">{timeRange}</p>
        </div>
    );
}

export default React.memo(GhostBlock);
