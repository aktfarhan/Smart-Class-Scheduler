import { Request, Response } from 'express';
import { instructorQuerySchema } from '../validation/schemas';
import { getFilterKey, MatchMode } from '../utils/filterHelpers';
import prisma from '../prismaClient';

/**
 * Controller to fetch instructors with optional filtering by:
 * - firstName (partial match, case-insensitive)
 * - lastName (partial match, case-insensitive)
 * - title (partial match, case-insensitive)
 * - departments (filter instructors belonging to department code)
 *
 * Includes related departments and sections taught.
 */
export const getInstructors = async (req: Request, res: Response) => {
    const parseResult = instructorQuerySchema.safeParse(req.query);

    if (!parseResult.success) {
        return res.status(400).json({ error: parseResult.error.issues });
    }

    const { firstName, lastName, title, departments, sections } =
        parseResult.data;

    const where: any = {};

    if (firstName)
        where.firstName = { contains: firstName, mode: 'insensitive' };

    if (lastName) where.lastName = { contains: lastName, mode: 'insensitive' };

    if (title) where.title = { contains: title, mode: 'insensitive' };

    if (departments) {
        where.departments = {
            some: {
                code: { equals: departments, mode: 'insensitive' },
            },
        };
    }

    const instructors = await prisma.instructor.findMany({
        where,
        include: {
            departments: true,
            sections: true,
        },
    });

    res.json(instructors);
};
