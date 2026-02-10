/**
 * Common database query patterns and helpers
 */

import { prisma } from './prisma'
import { Prisma } from '@prisma/client'
import { NotFoundError, DatabaseError } from './errors'

/**
 * Standard user select fields to reduce data transfer
 */
export const userSelectFields = {
    id: true,
    email: true,
    name: true,
    role: true,
    powerScore: true,
    universityId: true,
    referralCode: true,
    isPublicProfile: true,
    publicPersonId: true,
    emailVerified: true,
    firstName: true,
    lastName: true,
    bio: true,
    image: true
} as const

/**
 * Standard person select fields
 */
export const personSelectFields = {
    id: true,
    name: true,
    slug: true,
    role: true,
    fieldOfStudy: true,
    bio: true,
    linkedin: true,
    twitter: true,
    website: true,
    email: true,
    instituteId: true,
    labId: true,
    createdAt: true
} as const

/**
 * Standard university select fields
 */
export const universitySelectFields = {
    id: true,
    name: true,
    // slug: true, // Field does not exist on University model
    domains: true, // Correct field name
    logo: true,
    approved: true
} as const

/**
 * Safe find unique with proper error handling
 */
export async function findUniqueOrThrow<T>(
    model: string,
    query: () => Promise<T | null>,
    identifier?: string
): Promise<T> {
    const result = await query()

    if (!result) {
        throw new NotFoundError(model, identifier)
    }

    return result
}

/**
 * Execute transaction with error handling
 */
export async function withTransaction<T>(
    operations: Prisma.PrismaPromise<unknown>[],
    errorMessage: string = 'Transaction failed'
): Promise<T> {
    try {
        const result = await prisma.$transaction(operations)
        return result as T
    } catch (error) {
        console.error(errorMessage, error)
        throw new DatabaseError(errorMessage, { error })
    }
}

/**
 * Execute transaction with callback for more complex operations
 */
export async function withTransactionCallback<T>(
    callback: (tx: Prisma.TransactionClient) => Promise<T>,
    errorMessage: string = 'Transaction failed'
): Promise<T> {
    try {
        return await prisma.$transaction(callback)
    } catch (error) {
        console.error(errorMessage, error)
        throw new DatabaseError(errorMessage, { error })
    }
}

/**
 * Get user with university info in a single query
 */
export async function getUserWithUniversity(userId: string) {
    return prisma.user.findUnique({
        where: { id: userId },
        select: {
            ...userSelectFields,
            university: {
                select: universitySelectFields
            },
            secondaryUniversity: {
                select: universitySelectFields
            }
        }
    })
}

/**
 * Get institutes with labs for a university (solves N+1)
 */
export async function getInstitutesWithLabs(universityId: string) {
    return prisma.institute.findMany({
        where: { universityId, approved: true },
        orderBy: { name: 'asc' },
        select: {
            id: true,
            name: true,
            slug: true,
            universityId: true,
            labs: {
                where: { approved: true },
                orderBy: { name: 'asc' },
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    instituteId: true
                }
            }
        }
    })
}

/**
 * Get person with related institute and lab info
 */
export async function getPersonWithRelations(personId: string) {
    return prisma.person.findUnique({
        where: { id: personId },
        select: {
            ...personSelectFields,
            institute: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    universityId: true
                }
            },
            lab: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    instituteId: true,
                    institute: {
                        select: {
                            id: true,
                            name: true,
                            universityId: true
                        }
                    }
                }
            }
        }
    })
}

/**
 * Get university ID from institute or lab
 */
export async function getUniversityIdFromContext(
    instituteId?: string | null,
    labId?: string | null
): Promise<string | null> {
    if (labId) {
        const lab = await prisma.lab.findUnique({
            where: { id: labId },
            include: { institute: { select: { universityId: true } } }
        })
        return lab?.institute.universityId || null
    }

    if (instituteId) {
        const institute = await prisma.institute.findUnique({
            where: { id: instituteId },
            select: { universityId: true }
        })
        return institute?.universityId || null
    }

    return null
}

/**
 * Paginated query helper
 */
export interface PaginationParams {
    page?: number
    pageSize?: number
}

export interface PaginatedResult<T> {
    data: T[]
    pagination: {
        page: number
        pageSize: number
        total: number
        totalPages: number
    }
}

export async function paginate<T extends Record<string, unknown>>(
    query: (skip: number, take: number) => Promise<T[]>,
    countQuery: () => Promise<number>,
    params: PaginationParams = {}
): Promise<PaginatedResult<T>> {
    const page = Math.max(1, params.page || 1)
    const pageSize = Math.min(100, Math.max(1, params.pageSize || 20))
    const skip = (page - 1) * pageSize

    const [data, total] = await Promise.all([
        query(skip, pageSize),
        countQuery()
    ])

    return {
        data,
        pagination: {
            page,
            pageSize,
            total,
            totalPages: Math.ceil(total / pageSize)
        }
    }
}

/**
 * Batch operations helper for better performance
 */
export async function batchCreate<T>(
    items: T[],
    createFn: (item: T) => Prisma.PrismaPromise<unknown>,
    batchSize: number = 100
): Promise<void> {
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize)
        await prisma.$transaction(batch.map(createFn))
    }
}
