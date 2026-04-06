import type { ApiMeeting } from '../types';

// Parse 24h DB time directly to minutes from midnight
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

export function formatTime(meeting: ApiMeeting) {
    if (!meeting) return 'TBA';

    const startTime = meeting.startTime.split('T')[1].split('.')[0];
    const endTime = meeting.endTime.split('T')[1].split('.')[0];

    const standardStartTime = toStandardTime(startTime);
    const standardEndTime = toStandardTime(endTime);

    return `${standardStartTime} – ${standardEndTime}`;
}

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

function toStandardTime(time: string) {
    const [hours24, minutes] = time.split(':');
    const hours = parseInt(hours24, 10);

    // Calculating am/pm and convert hour 0 or 13-23
    const meridiem = hours >= 12 ? 'pm' : 'am';
    const hours12 = ((hours + 11) % 12) + 1;

    return `${hours12}:${minutes}${meridiem}`;
}

export function formatTimeLabel(hour: number) {
    const hours24 = Math.floor(hour);
    const minutes = hour % 1 === 0.5 ? '30' : '00';

    // Convert 24h to 12h logic
    const meridiem = hours24 >= 12 ? 'pm' : 'am';
    const hours12 = ((hours24 + 11) % 12) + 1;

    return `${hours12}:${minutes}${meridiem}`;
}

export function formatTimeToMinutes(time: string) {
    if (!time || time === 'TBA') return null;
    const [startPart, endPart] = time.split(' – ');
    return {
        startMins: toMinutes(startPart),
        endMins: toMinutes(endPart),
    };
}

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
        const [h, rest] = clean.split(':');
        hours = parseInt(h, 10);
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

// Convert total minutes from midnight to a display label like "2:30pm"
export function minutesToLabel(totalMinutes: number) {
    const hours24 = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const meridiem = hours24 >= 12 ? 'pm' : 'am';
    const hours12 = ((hours24 + 11) % 12) + 1;
    return minutes === 0
        ? `${hours12}${meridiem}`
        : `${hours12}:${String(minutes).padStart(2, '0')}${meridiem}`;
}

export const formatHour = (hour: number) => {
    const h = hour % 12 === 0 ? 12 : hour % 12;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${h} ${ampm}`;
};
