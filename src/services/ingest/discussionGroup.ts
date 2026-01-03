import prisma from '../../../server/prismaClient';
import { DiscussionGroupInput } from '../../types';

/**
 * Upserts a single discussion group by unique composite key (courseId + term).
 * If the discussion group exists, does nothing or updates fields if needed.
 * Otherwise, creates a new discussion group.
 *
 * @param discussionGroup - Object containing courseId and term
 * @returns The created or existing discussion group record
 */
export async function upsertDiscussionGroup(
    discussionGroup: DiscussionGroupInput
) {
    return prisma.discussionGroup.upsert({
        where: {
            courseId_term: {
                courseId: discussionGroup.courseId,
                term: discussionGroup.term,
            },
        },
        update: {}, // No updates for now
        create: {
            courseId: discussionGroup.courseId,
            term: discussionGroup.term,
        },
    });
}
