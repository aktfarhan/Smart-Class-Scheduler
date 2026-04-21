import { CALENDAR_CONFIG } from '../../../constants';
import { useState, useRef, useCallback } from 'react';
import type { TimeRange } from '../../../types';
import type { PointerEvent as ReactPointerEvent } from 'react';

export function useTimeRangeSlider(initialRange: TimeRange) {
    // ----- State -----
    const [timeRange, setTimeRange] = useState<TimeRange>(initialRange);

    // ----- Refs -----
    const sliderRef = useRef<HTMLDivElement | null>(null);
    const draggingRef = useRef<'start' | 'end' | null>(null);
    const trackRectRef = useRef<DOMRect | null>(null);

    // ----- Action Handlers -----

    // Convert a pointer X position to a time value and update the active thumb
    const updateSliderValue = useCallback((clientX: number) => {
        if (!draggingRef.current || !trackRectRef.current) return;

        // Capture which thumb is active now, before the async state update
        const thumb = draggingRef.current;
        const rect = trackRectRef.current;

        // Convert pointer position to a 0–1 percentage
        const percent = Math.min(Math.max(0, (clientX - rect.left) / rect.width), 1);

        // Convert percentage to time value and snap to nearest 0.5 hour
        const range = CALENDAR_CONFIG.END_TIME - CALENDAR_CONFIG.START_TIME;
        const rawValue = CALENDAR_CONFIG.START_TIME + percent * range;
        const newValue = Math.round(rawValue * 2) / 2;

        setTimeRange((prev) => {
            // Start thumb is clamped to stay before the end thumb
            if (thumb === 'start') {
                return { ...prev, start: Math.min(newValue, prev.end - 1) };
            }
            // End thumb is clamped to stay after the start thumb
            return { ...prev, end: Math.max(newValue, prev.start + 1) };
        });
    }, []);

    // Determine which thumb is closer to the tap and capture the pointer to the track
    const onPointerDown = useCallback(
        (e: ReactPointerEvent) => {
            if (e.button !== 0) return;
            e.preventDefault();

            // Cache the rect from the actual visible element that received the event
            trackRectRef.current = e.currentTarget.getBoundingClientRect();

            // Calculate which thumb is closer to the tapped position
            const rect = trackRectRef.current;
            const percent = (e.clientX - rect.left) / rect.width;
            const range = CALENDAR_CONFIG.END_TIME - CALENDAR_CONFIG.START_TIME;
            const tappedValue = CALENDAR_CONFIG.START_TIME + percent * range;

            const distToStart = Math.abs(tappedValue - timeRange.start);
            const distToEnd = Math.abs(tappedValue - timeRange.end);
            draggingRef.current = distToStart <= distToEnd ? 'start' : 'end';

            e.currentTarget.setPointerCapture(e.pointerId);
            updateSliderValue(e.clientX);
        },
        [timeRange, updateSliderValue],
    );

    // Update the slider value as the pointer moves (only while dragging)
    const onPointerMove = useCallback(
        (e: ReactPointerEvent) => {
            if (!draggingRef.current) return;
            updateSliderValue(e.clientX);
        },
        [updateSliderValue],
    );

    // Reset drag state when the pointer is released or capture is lost
    const onPointerUp = useCallback(() => {
        draggingRef.current = null;
    }, []);

    // ----- Export state, refs, and actions -----
    return {
        state: { timeRange },
        refs: { sliderRef },
        actions: { setTimeRange, onPointerDown, onPointerMove, onPointerUp },
    };
}
