import prisma from '../../../server/prismaClient';
import { SectionInput } from '../../types';

/**
 * Upserts a single section by its unique classNumber and term.
 * If the section exists, updates the provided fields; otherwise, creates a new section.
 *
 * @param section - Section input object containing section details
 * @returns The created or updated section record
 */
export async function upsertSection(section: SectionInput) {
    return prisma.section.upsert({
        where: {
            classNumber_term: {
                classNumber: section.classNumber,
                term: section.term,
            },
        },
        update: buildSectionData(section),
        create: {
            ...buildSectionData(section),
            classNumber: section.classNumber,
        },
    });
}

/**
 * Bulk upsert many sections inside a single transaction.
 * Rolls back all changes if any insertion or update fails.
 *
 * @param sections - Array of section input objects
 * @returns An array of created or updated section records
 */
export async function upsertSections(sections: SectionInput[]) {
    return prisma.$transaction(
        sections.map((section) =>
            prisma.section.upsert({
                where: {
                    classNumber_term: {
                        classNumber: section.classNumber,
                        term: section.term,
                    },
                },
                update: buildSectionData(section),
                create: {
                    ...buildSectionData(section),
                    classNumber: section.classNumber,
                },
            })
        )
    );
}

/**
 * Builds the data object for creating or updating a section.
 *
 * @param section - Section input object
 * @returns The data object used for Prisma upsert operations
 */
function buildSectionData(section: SectionInput) {
    return {
        sectionNumber: section.sectionNumber,
        term: section.term,
        isAsync: section.isAsync,
        courseId: section.courseId,
        type: section.type,
        discussionGroupId: section.discussionGroupId,
    };
}
