'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { parseSocialStats, calculateSocialReach, POWER_SCORE } from '@/lib/types'

/**
 * Approve a wiki revision - ADMIN ONLY
 * Updates revision status, applies content to UniPage, and increments author's power score
 * USES TRANSACTION FOR ATOMICITY
 */
export async function approveRevision(revisionId: string) {
    // Security check: Verify admin access
    await requireAdmin()

    // 1. Fetch revision details
    const revision = await prisma.wikiRevision.findUnique({
        where: { id: revisionId }
    })

    if (!revision) throw new Error("Revision not found")

    // 2. Perform Atomic Transaction
    await prisma.$transaction([
        // Update Revision Status -> APPROVED
        prisma.wikiRevision.update({
            where: { id: revisionId },
            data: { status: 'APPROVED' }
        }),

        // Update UniPage Content with new text
        prisma.uniPage.update({
            where: { id: revision.uniPageId },
            data: { content: revision.content }
        }),

        // Increment Power Score for Author (+20)
        prisma.user.update({
            where: { id: revision.authorId },
            data: {
                powerScore: { increment: POWER_SCORE.WIKI_APPROVAL_POINTS }
            }
        })
    ])

    revalidatePath('/admin/dashboard')
    revalidatePath(`/wiki`)
}

/**
 * Reject a wiki revision - ADMIN ONLY
 */
export async function rejectRevision(revisionId: string) {
    // Security check: Verify admin access
    await requireAdmin()

    await prisma.wikiRevision.update({
        where: { id: revisionId },
        data: { status: 'REJECTED' }
    })
    revalidatePath('/admin/dashboard')
}

/**
 * Approve a pending staff member - ADMIN ONLY
 */
export async function approveStaff(userId: string) {
    await requireAdmin()

    await prisma.user.update({
        where: { id: userId },
        data: { role: 'STAFF' }
    })

    revalidatePath('/admin/dashboard')
}

/**
 * Reject a pending staff member - ADMIN ONLY
 * Downgrades them to STUDENT
 */
export async function rejectStaff(userId: string) {
    await requireAdmin()

    await prisma.user.update({
        where: { id: userId },
        data: { role: 'STUDENT' }
    })

    revalidatePath('/admin/dashboard')
}

/**
 * Increment power score atomically
 */
export async function incrementPowerScore(userId: string, points: number) {
    await prisma.user.update({
        where: { id: userId },
        data: {
            powerScore: {
                increment: points
            }
        }
    })
}

/**
 * Full power score recalculation (Legacy/Sync fallback)
 */
export async function recalculatePowerScore(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId }
    })

    if (!user) return

    const referralsCount = await prisma.referral.count({
        where: { referrerId: userId }
    })

    const approvedEditsCount = await prisma.wikiRevision.count({
        where: {
            authorId: userId,
            status: 'APPROVED'
        }
    })

    const socialStats = parseSocialStats(user.socialStats)
    const socialReach = calculateSocialReach(socialStats)

    const powerScore =
        (referralsCount * POWER_SCORE.REFERRAL_POINTS) +
        (approvedEditsCount * POWER_SCORE.WIKI_APPROVAL_POINTS) +
        Math.floor(socialReach / POWER_SCORE.SOCIAL_DIVISOR)

    await prisma.user.update({
        where: { id: userId },
        data: { powerScore }
    })
}
