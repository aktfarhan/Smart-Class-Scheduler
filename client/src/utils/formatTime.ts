import type { ApiMeeting } from '../types';

// Convert 24-hour value to 12-hour display components
function to12Hour(hours24: number) {
    return {
        hours12: ((hours24 + 11) % 12) + 1,
        meridiem: hours24 >= 12 ? 'pm' : 'am',
    };
}

// ----- Parsing (to minutes) -----

/**
 * Parse 24h DB time directly to minutes from midnight.
 *
 * @param meeting - A single meeting with ISO start/end timestamps.
 * @returns Start and end times as minutes from midnight.
 */
export function meetingToMinutes(meeting: ApiMeeting) {
    const start = meeting.startTime.split('T')[1].split('.')[0];
    const end = meeting.endTime.split('T')[1].split('.')[0];
    const [startHours, startMinutes] = start.split(':');
    const [endHours, endMinutes] = end.split(':');
    return {
        startMins: parseInt(startHours, 10) * 60 + parseInt(startMinutes, 10),
        endMins: parseInt(endHours, 10) * 60 + parseInt(endMinutes, 10),
    };
}

/**
 * Convert a string like "8am" or "10:30pm" to minutes from midnight.
 *
 * @param time - A 12-hour time string with am/pm suffix.
 * @returns Total minutes from midnight.
 */
export function toMinutes(time: string) {
    if (!time) return 0;

    // Normalize: lowercase and remove spaces to prevent "8 am" vs "8am" issues
    const clean = time.toLowerCase().trim();

    // Safety check for colons (handles "8am" vs "8:00am")
    const hasColon = clean.includes(':');

    let hours: number;
    let minutes: number;
    let meridiem: string;

    if (hasColon) {
        // Standard logic for "8:30pm"
        const [hoursStr, rest] = clean.split(':');
        hours = parseInt(hoursStr, 10);
        minutes = parseInt(rest.substring(0, 2), 10);
        meridiem = rest.substring(2).trim();
    } else {
        // Simple logic for "12pm" or "8am"
        const match = clean.match(/(\d+)(am|pm)/);
        if (!match) return 0;
        hours = parseInt(match[1], 10);
        minutes = 0;
        meridiem = match[2];
    }

    // Standard 12-to-24 hour conversion math
    if (meridiem === 'pm' && hours !== 12) hours += 12;
    if (meridiem === 'am' && hours === 12) hours = 0;

    return hours * 60 + minutes;
}

// ----- Formatting (to display strings) -----

/**
 * Convert total minutes from midnight to a display label like "2:30pm".
 *
 * @param totalMinutes - Minutes elapsed since midnight.
 * @returns Formatted 12-hour time string with am/pm.
 */
export function minutesToLabel(totalMinutes: number) {
    const { hours12, meridiem } = to12Hour(Math.floor(totalMinutes / 60));
    const minutes = totalMinutes % 60;
    return `${hours12}:${String(minutes).padStart(2, '0')}${meridiem}`;
}

/**
 * Format a single meeting's time range for display.
 *
 * @param meeting - A single meeting with ISO start/end timestamps.
 * @returns Formatted range like "8:30am – 10:00am".
 */
export function formatTime(meeting: ApiMeeting) {
    const { startMins, endMins } = meetingToMinutes(meeting);
    return `${minutesToLabel(startMins)} – ${minutesToLabel(endMins)}`;
}

/**
 * Format multiple meetings into a grouped display string like "MWF 8:30am – 10:00am".
 *
 * @param meetings - Array of meetings to group by time.
 * @returns Grouped time string, or "TBA" if empty.
 */
export function formatTimes(meetings: ApiMeeting[]) {
    if (!meetings.length) return 'TBA';

    const groups = new Map<string, string[]>();

    for (const meeting of meetings) {
        const time = formatTime(meeting);
        if (!groups.has(time)) groups.set(time, []);
        groups.get(time)!.push(meeting.day);
    }

    return Array.from(groups.entries())
        .map(([time, days]) => `${days.join('')} ${time}`)
        .join(' | ');
}

/**
 * Convert a decimal hour (e.g., 8.5) to a time label like "8:30am".
 *
 * @param hour - Decimal hour value where .5 = 30 minutes.
 * @returns Formatted 12-hour time string with am/pm.
 */
export function formatTimeLabel(hour: number) {
    return minutesToLabel(hour * 60);
}

/**
 * Convert an integer hour to an uppercase label like "8 AM" for calendar grid.
 *
 * @param hour - Integer hour in 24-hour format.
 * @returns Formatted label with space-separated uppercase meridiem.
 */
export function formatHour(hour: number) {
    const { hours12, meridiem } = to12Hour(hour);
    return `${hours12} ${meridiem.toUpperCase()}`;
}
