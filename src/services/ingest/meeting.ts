import prisma from '../../../server/prismaClient';
import { MeetingInput } from '../../types';

/**
 * Helper to build create/update data for meetings.
 *
 * @param meeting - Meeting input object
 * @returns The data object for Prisma upsert
 */
function buildMeetingData(meeting: MeetingInput) {
    return {
        day: meeting.day,
        startTime: meeting.startTime,
        endTime: meeting.endTime,
        location: meeting.location,
        sectionId: meeting.sectionId,
    };
}

/**
 * Upserts a single meeting by its unique combination of sectionId, day, startTime, and endTime.
 * If a matching meeting exists, updates the location.
 * Otherwise, creates a new meeting.
 *
 * @param meeting - Meeting input object containing day, times, location, and sectionId
 * @returns The created or updated meeting record
 */
export async function upsertMeeting(meeting: MeetingInput) {
    return prisma.meeting.upsert({
        // Unique constraint on sectionId, day, startTime, and endTime
        where: {
            sectionId_day_startTime_endTime: {
                sectionId: meeting.sectionId,
                day: meeting.day,
                startTime: meeting.startTime,
                endTime: meeting.endTime,
            },
        },
        update: { location: meeting.location },
        create: buildMeetingData(meeting),
    });
}

/**
 * Bulk upsert many meetings inside a single transaction.
 * Rolls back all changes if any insertion or update fails.
 *
 * @param meetings - Array of meeting input objects
 * @returns An array of created or updated meeting records
 */
export async function upsertMeetings(meetings: MeetingInput[]) {
    return prisma.$transaction(
        meetings.map((meeting) =>
            prisma.meeting.upsert({
                // Unique constraint on sectionId, day, startTime, and endTime
                where: {
                    sectionId_day_startTime_endTime: {
                        sectionId: meeting.sectionId,
                        day: meeting.day,
                        startTime: meeting.startTime,
                        endTime: meeting.endTime,
                    },
                },
                update: { location: meeting.location },
                create: buildMeetingData(meeting),
            })
        )
    );
}
