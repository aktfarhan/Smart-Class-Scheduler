import type { Block, Day } from '../../types';

// Shared shape for calendar blocks and ghosts in column assignment
interface TimeSlot {
    endMins: number;
    courseId: number;
    startMins: number;
    sectionId: number;
    columnIndex: number;
    totalColumns: number;
}

/**
 * Sort blocks by start time and assign side-by-side column positions.
 * Uses a sweep-line algorithm to group overlapping blocks, then greedily
 * assigns each block to the first non-overlapping column.
 *
 * @param blocks - Array of calendar blocks or ghost blocks to assign columns to
 */
export function assignColumns(blocks: TimeSlot[]) {
    // No column assignment needed for 0 or 1 block
    if (blocks.length < 2) return;

    // Sort by start time, longer blocks first, then courseId + sectionId for stable columns
    blocks.sort(
        (a, b) =>
            a.startMins - b.startMins ||
            b.endMins - a.endMins ||
            a.courseId - b.courseId ||
            a.sectionId - b.sectionId,
    );

    // Track the current overlap group's start index and furthest end time
    let groupStart = 0;
    let maxEnd = blocks[0].endMins;

    // Sweep through blocks to find overlapping groups
    for (let i = 1; i <= blocks.length; i++) {
        // Extend the current group if this block overlaps
        if (i < blocks.length && blocks[i].startMins < maxEnd) {
            maxEnd = Math.max(maxEnd, blocks[i].endMins);
            continue;
        }

        // Process the completed overlap group [groupStart, i)
        if (i - groupStart > 1) {
            const columns: TimeSlot[][] = [];

            // Greedy: place each block in the first column with no overlap
            for (let j = groupStart; j < i; j++) {
                const block = blocks[j];

                // Find a column where the last block ends before this one starts
                const col = columns.findIndex(
                    (column) => column[column.length - 1].endMins <= block.startMins,
                );

                if (col !== -1) {
                    // Fit into existing column
                    columns[col].push(block);
                    block.columnIndex = col;
                } else {
                    // Open a new column
                    block.columnIndex = columns.length;
                    columns.push([block]);
                }
            }

            // All blocks in the group share the same total column count
            for (let j = groupStart; j < i; j++) {
                blocks[j].totalColumns = columns.length;
            }
        }

        // Reset for the next group
        groupStart = i;
        if (i < blocks.length) maxEnd = blocks[i].endMins;
    }
}

/**
 * Detect overlapping blocks and assign side-by-side column positions.
 *
 * @param grouped - Blocks grouped by day key
 * @param days - Array of visible day keys (M-F or M-Su)
 */
export function resolveBlockConflicts(grouped: Record<string, Block[]>, days: Day[]) {
    for (const day of days) {
        const dayBlocks = grouped[day];
        if (dayBlocks.length < 2) continue;

        // Assign side-by-side columns
        assignColumns(dayBlocks);

        // Mark blocks that share a column group as conflicting
        for (const block of dayBlocks) {
            if (block.totalColumns > 1) block.hasConflict = true;
        }
    }
}
