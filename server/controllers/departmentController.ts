import { Request, Response } from 'express';
import { departmentQuerySchema } from '../validation/schemas';
import { getFilterKey, MatchMode } from '../utils/filterHelpers';
import prisma from '../prismaClient';

/**
 * Controller to fetch departments with optional filtering by:
 * - code (match mode: partial or exact)
 * - title (partial match, case-insensitive)
 *
 * Includes related courses and instructors.
 */
export const getDepartments = async (req: Request, res: Response) => {
    const parseResult = departmentQuerySchema.safeParse(req.query);

    if (!parseResult.success) {
        return res.status(400).json({ error: parseResult.error.issues });
    }

    const { code, codeMatchMode = 'partial', title } = parseResult.data;

    const where: any = {};

    const codeMode: MatchMode = codeMatchMode ?? 'partial';
    if (code) {
        const filterKey = getFilterKey(codeMode);
        where.code = { [filterKey]: code, mode: 'insensitive' };
    }
    if (title) where.title = { contains: title, mode: 'insensitive' };

    const departments = await prisma.department.findMany({
        where,
        include: {
            courses: true,
            instructors: true,
        },
    });

    res.json(departments);
};
