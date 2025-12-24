import * as fs from 'fs';

// All of the valid class durations
const CLASS_DURATIONS = [
    50, 60, 75, 89, 90, 100, 105, 110, 120, 150, 165, 170, 179, 180, 195, 210,
    230, 239, 240, 360, 480, 570, 600, 630, 660,
];

/**
 * Normalizes a class time string into 24-hour formatted start and end times.
 *
 * @param time - A time range string, e.g. "11:00 - 12:15PM"
 * @returns Object with start and end times in "HH:MM:SS"
 * @throws Throws an error if the time range is invalid or ambiguous
 */
function normalizeTimeString(time: string) {
    const [startTime, endTimeMeridiem] = time.split(' - ');

    // Check AM or PM
    const [endTime, meridiem] = endTimeMeridiem.split(' ');

    // Check if startTime is AM or PM
    const startAM = timeToMinutes(startTime, 'am');
    const startPM = timeToMinutes(startTime, 'pm');
    const endTimeMin = timeToMinutes(endTime, meridiem);

    // Check the duration
    const durationAM = endTimeMin - startAM;
    const durationPM = endTimeMin - startPM;

    // Return the time with the correct meridiem
    if (CLASS_DURATIONS.includes(durationAM)) {
        console.log('am');
        return {
            startTime: minutesToHHMMSS(startAM),
            endTime: minutesToHHMMSS(endTimeMin),
        };
    }
    if (CLASS_DURATIONS.includes(durationPM)) {
        console.log('pm');
        return {
            startTime: minutesToHHMMSS(startPM),
            endTime: minutesToHHMMSS(endTimeMin),
        };
    }

    // Throw an error if the duratio is not in the possible durations
    throw new Error(`Invalid time range: ${time}`);
}

/**
 * Converts a time string and meridiem to the number of minutes after midnight.
 *
 * @param time - A time string "H:MM" format.
 * @param meridiem - Either 'am' or 'pm'.
 * @returns - Number of minutes after midnight.
 */
function timeToMinutes(time: string, meridiem: string) {
    // Split the hour and minutes
    let [hour, minutes] = time.split(':').map((time) => Number(time));

    // Checking for edge cases when the hour is 12
    if (meridiem === 'am' && hour === 12) hour = 0;
    if (meridiem === 'pm' && hour != 12) hour += 12;

    // Return minutes after midnight
    return hour * 60 + minutes;
}

/**
 * Converts minutes after midnight to a "HH:MM:SS" formatted string.
 *
 * @param time - Number of minutes after midnight.
 * @returns - Time string in "HH:MM:SS" format.
 */
function minutesToHHMMSS(time: number) {
    const hour = Math.floor(time / 60)
        .toString()
        .padStart(2, '0');
    const minutes = (time % 60).toString().padStart(2, '0');

    // Return "HH:MM:SS" format
    return `${hour}:${minutes}:00`;
}

const a = normalizeTimeString('5:30 - 8:15 pm');
console.log(a);
