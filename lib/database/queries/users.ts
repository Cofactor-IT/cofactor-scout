/**
 * User Queries
 * 
 * Database queries for user data with statistics.
 */
import { prisma } from '@/lib/database/prisma'

/**
 * Find user with submission statistics
 * 
 * @param userId - User ID
 * @returns User with stats or null
 */
export async function findUserWithStats(userId: string) {
    return await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            fullName: true,
            firstName: true,
            lastName: true,
            preferredName: true,
            role: true,
            profilePictureUrl: true,
            totalSubmissions: true,
            pendingSubmissions: true,
            approvedSubmissions: true,
        }
    })
}
