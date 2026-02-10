import { prisma } from '@/lib/prisma'

export async function getDailyChangeCount(userId: string) {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const [revisions, labs, people, institutes] = await Promise.all([
        prisma.wikiRevision.count({
            where: { authorId: userId, createdAt: { gte: startOfDay } }
        }),
        prisma.lab.count({
            where: { authorId: userId, createdAt: { gte: startOfDay } }
        }),
        prisma.person.count({
            where: { authorId: userId, createdAt: { gte: startOfDay } }
        }),
        prisma.institute.count({
            where: { authorId: userId, createdAt: { gte: startOfDay } }
        })
    ])

    return revisions + labs + people + institutes;
}
