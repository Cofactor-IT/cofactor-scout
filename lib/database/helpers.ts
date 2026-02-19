/**
 * Common database query patterns and helpers
 */

import { prisma } from '@/lib/database/prisma'
import { Prisma } from '@prisma/client'
import { NotFoundError, DatabaseError } from '@/lib/errors'

/**
 * Standard user select fields to reduce data transfer
 */
export const userSelectFields = {
    id: true,
    email: true,
    fullName: true,
    firstName: true,
    lastName: true,
    preferredName: true,
    role: true,
    emailVerified: true,
    bio: true,
    profilePictureUrl: true
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
    callback: (tx: any) => Promise<T>,
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
 * Get user with submissions stats
 */
export async function getUserWithStats(userId: string) {
    return prisma.user.findUnique({
        where: { id: userId },
        select: {
            ...userSelectFields,
            totalSubmissions: true,
            pendingSubmissions: true,
            approvedSubmissions: true
        }
    })
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
