'use server'

import { prisma } from '@/lib/prisma'
import { WikiRevision } from '@prisma/client'

// Define the return type structure
export type GroupedRevisions = {
    date: string // "Today", "Yesterday", or "February 10, 2026"
    revisions: (WikiRevision & {
        uniPage: { name: string, slug: string, instituteId: string | null, labId: string | null },
        author: { name: string | null, email: string }
    })[]
}[]

export async function getRecentActivity(scope: { universityId?: string, instituteId?: string, labId?: string }) {
    const { universityId, instituteId, labId } = scope

    // Build the query
    let whereClause: any = {}

    if (labId) {
        // Build query for lab: pages belonging to this lab
        whereClause = {
            uniPage: {
                labId: labId
            }
        }
    } else if (instituteId) {
        // Pages belonging to this institute (direct or via labs)
        whereClause = {
            uniPage: {
                OR: [
                    { instituteId: instituteId },
                    { lab: { instituteId: instituteId } }
                ]
            }
        }
    } else if (universityId) {
        // Pages belonging to this university
        whereClause = {
            uniPage: {
                universityId: universityId
            }
        }
    } else {
        throw new Error("No scope provided for activity log")
    }

    // Fetch revisions
    const revisions = await prisma.wikiRevision.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: 50, // Limit to last 50 edits
        include: {
            uniPage: {
                select: {
                    name: true,
                    slug: true,
                    instituteId: true,
                    labId: true
                }
            },
            author: {
                select: {
                    name: true,
                    email: true
                }
            }
        }
    })

    // Group by Date
    const grouped: GroupedRevisions = []

    revisions.forEach(rev => {
        const date = new Date(rev.createdAt)
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        let dateLabel = date.toLocaleDateString()

        if (date.toDateString() === today.toDateString()) {
            dateLabel = 'Today'
        } else if (date.toDateString() === yesterday.toDateString()) {
            dateLabel = 'Yesterday'
        }

        let group = grouped.find(g => g.date === dateLabel)
        if (!group) {
            group = { date: dateLabel, revisions: [] }
            grouped.push(group)
        }
        group.revisions.push(rev)
    })

    return grouped
}
