'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { parseSocialStats, calculateSocialReach, POWER_SCORE } from '@/lib/types'

/**
 * Approve a wiki revision - ADMIN ONLY
 * Updates revision status, applies content to UniPage, and increments author's power score
 */
export async function approveRevision(revisionId: string) {
    // Security check: Verify admin access
    await requireAdmin()

    const revision = await prisma.wikiRevision.findUnique({
        where: { id: revisionId },
        include: { author: true }
    })

    if (!revision) throw new Error("Revision not found")

    // Update Revision Status
    await prisma.wikiRevision.update({
        where: { id: revisionId },
        data: { status: 'APPROVED' }
    })

    // Update UniPage Content
    await prisma.uniPage.update({
        where: { id: revision.uniPageId },
        data: { content: revision.content }
    })

    // Incremental Power Score update - add points for this approval
    await incrementPowerScore(revision.authorId, POWER_SCORE.WIKI_APPROVAL_POINTS)

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
 * Increment power score atomically
 * Used for individual actions (referral, wiki approval) instead of full recalculation
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
 * Full power score recalculation
 * Use sparingly - only when social stats are synced or for data consistency checks
 */
export async function recalculatePowerScore(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId }
    })

    if (!user) return

    // Count referrals made by this user
    const referralsCount = await prisma.referral.count({
        where: { referrerId: userId }
    })

    // Count approved wiki edits
    const approvedEditsCount = await prisma.wikiRevision.count({
        where: {
            authorId: userId,
            status: 'APPROVED'
        }
    })

    // Parse social stats with type safety
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

/**
 * Process a new referral and increment referrer's power score
 */
export async function processReferral(referrerId: string, refereeId: string) {
    // Create the referral record
    await prisma.referral.create({
        data: {
            referrerId,
            refereeId
        }
    })

    // Increment referrer's power score
    await incrementPowerScore(referrerId, POWER_SCORE.REFERRAL_POINTS)
}
