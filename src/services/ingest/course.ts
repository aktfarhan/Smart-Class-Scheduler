import prisma from '../../../server/prismaClient';
import { CourseInput } from '../../types';

/**
 * Upserts a single course by its unique composite key (departmentId + code).
 * If the course exists, updates the title.
 * Otherwise, creates a new course.
 *
 * @param course - Course input object containing code, title, and departmentId
 * @returns The created or updated course record
 */
export async function upsertCourse(course: CourseInput) {
    return prisma.course.upsert({
        where: {
            departmentId_code: {
                departmentId: course.departmentId,
                code: course.code,
            },
        },
        update: {
            title: course.title,
        },
        create: {
            departmentId: course.departmentId,
            code: course.code,
            title: course.title,
        },
    });
}

/**
 * Bulk upsert many courses inside a single transaction.
 * Rolls back all changes if any insertion or update fails.
 *
 * @param courses - Array of courses inside a single transaction.
 * @returns An array of created or updated course records
 */
export async function upsertCourses(courses: CourseInput[]) {
    return prisma.$transaction(
        courses.map((course) =>
            prisma.course.upsert({
                where: {
                    departmentId_code: {
                        departmentId: course.departmentId,
                        code: course.code,
                    },
                },
                update: { title: course.title },
                create: {
                    departmentId: course.departmentId,
                    code: course.code,
                    title: course.title,
                },
            })
        )
    );
}
