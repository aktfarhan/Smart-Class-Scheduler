import { Request, Response } from 'express';
import { courseQuerySchema } from '../validation/schemas';
import { getFilterKey, MatchMode } from '../utils/filterHelpers';
import prisma from '../prismaClient';

/**
 * Controller to fetch courses with optional filtering by:
 * - code (with match mode: partial or exact)
 * - title (partial match, case-insensitive)
 * - department code (exact match, case-insensitive)
 *
 * Includes related department, sections, and discussion groups.
 */
export const getCourses = async (req: Request, res: Response) => {
    const parseResult = courseQuerySchema.safeParse(req.query);

    if (!parseResult.success) {
        return res.status(400).json({ error: parseResult.error.issues });
    }

    const {
        code,
        codeMatchMode = 'partial',
        title,
        department,
    } = parseResult.data;

    const where: any = {};

    const codeMode: MatchMode = codeMatchMode ?? 'partial';

    if (code) {
        const filterKey = getFilterKey(codeMode);
        where.code = { [filterKey]: code, mode: 'insensitive' };
    }

    if (title) {
        where.title = { contains: title, mode: 'insensitive' };
    }

    if (department) {
        where.department = {
            code: { equals: department, mode: 'insensitive' },
        };
    }

    const courses = await prisma.course.findMany({
        where,
        include: {
            department: true,
            sections: true,
            discussionGroups: true,
        },
    });

    res.json(courses);
};
