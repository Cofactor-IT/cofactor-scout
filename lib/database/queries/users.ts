import { prisma } from '@/lib/database/prisma'

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
