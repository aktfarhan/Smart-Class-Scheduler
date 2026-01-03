import prisma from '../../../server/prismaClient';
import { Instructor } from '../../types';

/**
 * Upserts an instructor identified uniquely by email.
 * Updates instructor details and links to given departments.
 * Creates a new instructor if no matching email exists.
 *
 * @param instructor - Instructor data object
 * @param departmentIds - Array of department IDs to link
 * @returns The created or updated instructor record
 */
export async function upsertInstructorViaEmail(
    instructor: Instructor,
    departmentIds: number[]
) {
    return prisma.instructor.upsert({
        where: { email: instructor.email! }, // Unique constraint on email
        update: {
            firstName: instructor.firstName,
            lastName: instructor.lastName,
            title: instructor.title,
            phone: instructor.phone,
            departments: {
                // Connect instructor to multiple departments if not already linked
                connect: departmentIds.map((id) => ({ id })),
            },
        },
        create: {
            firstName: instructor.firstName,
            lastName: instructor.lastName,
            title: instructor.title,
            email: instructor.email,
            phone: instructor.phone,
            departments: {
                // Link to departments on creation
                connect: departmentIds.map((id) => ({ id })),
            },
        },
    });
}

/**
 * Upserts an instructor based on name and department linkage using a preloaded map.
 * If instructor exists in the map, updates their details and links departments.
 * Otherwise, creates a new instructor and updates the map accordingly.
 *
 * @param instructor - Instructor data object
 * @param departmentIds - Array of department IDs to link
 * @param instructorMap - Map of "firstName:lastName:departmentId" to instructorId
 * @returns The created or updated instructor record
 */
export async function upsertInstructorViaLink(
    instructor: Instructor,
    departmentIds: number[],
    instructorMap: Map<string, number>
) {
    // Construct key for lookup in the map by name + department
    const key = `${instructor.firstName}:${instructor.lastName}:${departmentIds[0]}`;
    if (instructorMap.has(key)) {
        const id = instructorMap.get(key)!;
        // Update the existing instructor record
        return prisma.instructor.update({
            where: { id },
            data: {
                title: instructor.title,
                email: instructor.email,
                phone: instructor.phone,
                departments: {
                    // Connect to any new departments if needed
                    connect: departmentIds.map((id) => ({ id })),
                },
            },
        });
    } else {
        // Create new instructor and link to departments
        const created = await prisma.instructor.create({
            data: {
                firstName: instructor.firstName,
                lastName: instructor.lastName,
                title: instructor.title,
                email: instructor.email,
                phone: instructor.phone,
                departments: {
                    connect: departmentIds.map((id) => ({ id })),
                },
            },
        });

        // Add new entries to the instructor map for quick lookup
        for (const deptId of departmentIds) {
            const mapKey = `${instructor.firstName}:${instructor.lastName}:${deptId}`;
            instructorMap.set(mapKey, created.id);
        }
        return created;
    }
}

/**
 * Preloads a map of instructors keyed by "firstName:lastName:departmentId"
 * for quick lookup during ingestion/upsert operations.
 *
 * @returns A Map where keys are instructor name+department strings, and values are instructor IDs
 */
export async function preloadInstructorMap() {
    const instructorMap = new Map<string, number>();

    // Load all instructors with their linked departments from the database
    const allInstructors = await prisma.instructor.findMany({
        include: { departments: true },
    });

    // Populate the map with keys combining instructor name and department ID
    for (const instructor of allInstructors) {
        for (const department of instructor.departments) {
            const key = `${instructor.firstName}:${instructor.lastName}:${department.id}`;
            instructorMap.set(key, instructor.id);
        }
    }

    return instructorMap;
}
