'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
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

        // Update UniPage Content with new text AND set published = true
        prisma.uniPage.update({
            where: { id: revision.uniPageId },
            data: {
                content: revision.content,
                published: true
            }
        }),

        // Increment Power Score for Author (+20)
        prisma.user.update({
            where: { id: revision.authorId },
            data: {
                powerScore: { increment: POWER_SCORE.WIKI_APPROVAL_POINTS }
            }
        })
    ])

    // Fetch slug for revalidation (optimization: could fetch in initial query)
    const uniPage = await prisma.uniPage.findUnique({
        where: { id: revision.uniPageId },
        select: { slug: true }
    })

    if (uniPage) {
        revalidatePath(`/wiki/${uniPage.slug}`)
    }

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

/**
 * Delete a Wiki Page (UniPage) - ADMIN ONLY
 * Removes the page and all its revisions.
 */
export async function deletePage(slug: string) {
    await requireAdmin()

    // Find page ID first
    const page = await prisma.uniPage.findUnique({ where: { slug } })
    if (!page) return

    await prisma.$transaction([
        prisma.wikiRevision.deleteMany({
            where: { uniPageId: page.id }
        }),
        prisma.uniPage.delete({
            where: { id: page.id }
        })
    ])

    revalidatePath('/wiki')
    redirect('/wiki')
}

/**
 * Approve Institute
 */
export async function approveInstitute(id: string) {
    await requireAdmin()
    await prisma.institute.update({
        where: { id },
        data: { approved: true }
    })
    revalidatePath('/admin/dashboard')
    revalidatePath('/wiki')
}

/**
 * Reject Institute
 */
export async function rejectInstitute(id: string) {
    await requireAdmin()
    await prisma.institute.delete({
        where: { id }
    })
    revalidatePath('/admin/dashboard')
}

/**
 * Approve Lab
 */
export async function approveLab(id: string) {
    await requireAdmin()
    const lab = await prisma.lab.update({
        where: { id },
        data: { approved: true },
        include: { institute: true }
    })
    revalidatePath('/admin/dashboard')
    revalidatePath(`/wiki/institutes/${lab.institute.slug}`)
}

/**
 * Reject Lab
 */
export async function rejectLab(id: string) {
    await requireAdmin()
    await prisma.lab.delete({
        where: { id }
    })
    revalidatePath('/admin/dashboard')
}

/**
 * Approve Secondary University Request - ADMIN ONLY
 * Sets the user's secondaryUniversityId and updates request status
 */
export async function approveSecondaryUniversityRequest(requestId: string) {
    await requireAdmin()

    const request = await prisma.secondaryUniversityRequest.findUnique({
        where: { id: requestId }
    })

    if (!request) {
        throw new Error('Request not found')
    }

    if (request.status !== 'PENDING') {
        throw new Error('Request is not pending')
    }

    await prisma.$transaction([
        // Update user's secondary university
        prisma.user.update({
            where: { id: request.userId },
            data: { secondaryUniversityId: request.universityId }
        }),
        // Mark request as approved
        prisma.secondaryUniversityRequest.update({
            where: { id: requestId },
            data: { status: 'APPROVED' }
        })
    ])

    revalidatePath('/admin/dashboard')
    revalidatePath('/profile')
}

/**
 * Reject Secondary University Request - ADMIN ONLY
 */
export async function rejectSecondaryUniversityRequest(requestId: string) {
    await requireAdmin()

    await prisma.secondaryUniversityRequest.update({
        where: { id: requestId },
        data: { status: 'REJECTED' }
    })

    revalidatePath('/admin/dashboard')
    revalidatePath('/profile')
}
