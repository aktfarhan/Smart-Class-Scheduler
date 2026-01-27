import type { ApiMeeting } from '../types';

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

function toMinutes(time: string) {
    const [h, rest] = time.split(':');
    const m = rest.substring(0, 2);
    const meridiem = rest.substring(2);

    let hours = parseInt(h, 10);
    const minutes = parseInt(m, 10);

    if (meridiem === 'pm' && hours !== 12) hours += 12;
    if (meridiem === 'am' && hours === 12) hours = 0;

    return hours * 60 + minutes;
}

export const formatHour = (hour: number) => {
    const h = hour % 12 === 0 ? 12 : hour % 12;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${h} ${ampm}`;
};
