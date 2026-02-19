import { prisma } from '@/lib/database/prisma'

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
