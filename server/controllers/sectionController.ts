import { Request, Response } from 'express';
import { sectionQuerySchema } from '../validation/schemas';
import { getFilterKey, MatchMode } from '../utils/filterHelpers';
import prisma from '../prismaClient';

/**
 * Controller to fetch sections with optional filtering by:
 * - term (exact match)
 * - days (list of days, with strict or partial match mode)
 * - courseCode (with match mode: partial or exact)
 * - instructorName (search in firstName or lastName)
 * - type (section type, case-insensitive)
 * - isAsync (boolean flag)
 *
 * Includes related course (with department), instructors, meetings, and discussion group.
 */
export const getSections = async (req: Request, res: Response) => {
    const parseResult = sectionQuerySchema.safeParse(req.query);

    if (!parseResult.success) {
        return res.status(400).json({ error: parseResult.error.issues });
    }

    const {
        term,
        days,
        daysMatchMode = 'partial',
        courseCode,
        courseCodeMatchMode = 'partial',
        instructorName,
        type,
        isAsync,
    } = parseResult.data;

    const where: any = {};

    if (term) {
        where.term = term;
    }

    if (days) {
        const daysArray = days.split(',');

        if (daysMatchMode === 'strict') {
            where.AND = [
                ...daysArray.map((day) => ({
                    meetings: {
                        some: { day },
                    },
                })),
                {
                    NOT: {
                        meetings: {
                            some: {
                                day: { notIn: daysArray },
                            },
                        },
                    },
                },
            ];
        } else {
            where.meetings = {
                some: {
                    day: { in: daysArray },
                },
            };
        }
    }

    const codeMode: MatchMode = courseCodeMatchMode ?? 'partial';

    if (courseCode) {
        const filterKey = getFilterKey(codeMode);
        where.course = {
            code: { [filterKey]: courseCode, mode: 'insensitive' },
        };
    }

    if (instructorName) {
        where.instructors = {
            some: {
                OR: [
                    {
                        firstName: {
                            contains: instructorName,
                            mode: 'insensitive',
                        },
                    },
                    {
                        lastName: {
                            contains: instructorName,
                            mode: 'insensitive',
                        },
                    },
                ],
            },
        };
    }

    if (type) {
        where.type = type.toUpperCase();
    }

    if (isAsync !== undefined) {
        where.isAsync = isAsync === 'true';
    }

    const sections = await prisma.section.findMany({
        where,
        include: {
            course: {
                include: { department: true },
            },
            instructors: true,
            meetings: true,
            discussionGroup: true,
        },
    });

    res.json(sections);
};
