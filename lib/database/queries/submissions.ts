/**
 * Submissions Queries
 * 
 * Database queries for research submissions.
 */
import { prisma } from '@/lib/database/prisma'

/**
 * Find all non-draft submissions for a user
 * 
 * @param userId - User ID
 * @returns Array of user's submissions
 */
export async function findSubmissionsByUserId(userId: string) {
    return await prisma.researchSubmission.findMany({
        where: { userId, isDraft: false },
        orderBy: { submittedAt: 'desc' },
        select: {
            id: true,
            researcherName: true,
            researchTopic: true,
            status: true,
            submittedAt: true,
        }
    })
}
