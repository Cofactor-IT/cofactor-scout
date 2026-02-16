'use server'

import { prisma } from '@/lib/database/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/permissions'
import { POWER_SCORE, parseSocialStats, calculateSocialReach } from '@/lib/types'
import { logger } from '@/lib/logger'
import { updateReputationAfterModeration, calculateReputation } from '@/lib/moderation/reputation'

// ============================================================================
// Types
// ============================================================================

interface RevisionWithDetails {
    id: string
    uniPageId: string
    authorId: string
    content: string
    createdAt: Date
    uniPage: { id: string; name: string; slug: string }
    author: {
        id: string
        name: string | null
        email: string
        powerScore: number
        createdAt: Date
        emailVerified: Date | null
    }
}

// ============================================================================
// Revision Management
// ============================================================================

/**
 * Approve a wiki revision - ADMIN ONLY
 */
export async function approveRevision(revisionId: string, notes?: string | FormData) {
    await requireAdmin()
    const finalNotes = typeof notes === 'string' ? notes : undefined

    const revision = await fetchRevisionForModeration(revisionId)
    if (!revision) throw new Error("Revision not found")

    await executeApprovalTransaction(revision, finalNotes)
    await updateReputationAfterModeration(revision.authorId, 'approved')

    logger.info('Wiki revision approved', {
        revisionId,
        authorId: revision.authorId,
        pageId: revision.uniPageId,
        notes: finalNotes
    })

    await revalidateAfterApproval(revision.uniPageId, revision.uniPage.slug)
}

/**
 * Reject a wiki revision - ADMIN ONLY
 */
export async function rejectRevision(revisionId: string, notes?: string | FormData, reason?: string) {
    await requireAdmin()
    const finalNotes = typeof notes === 'string' ? notes : undefined

    const revision = await fetchRevisionForModeration(revisionId)
    if (!revision) throw new Error("Revision not found")

    await prisma.wikiRevision.update({
        where: { id: revisionId },
        data: {
            status: 'REJECTED'
        }
    })

    await updateReputationAfterModeration(revision.authorId, 'rejected')

    logger.info('Wiki revision rejected', {
        revisionId,
        authorId: revision.authorId,
        pageId: revision.uniPageId,
        reason,
        notes: finalNotes
    })

    revalidatePath('/admin/dashboard')
}

/**
 * Fetch revision with moderation context
 */
async function fetchRevisionForModeration(revisionId: string) {
    return prisma.wikiRevision.findUnique({
        where: { id: revisionId },
        select: {
            id: true,
            uniPageId: true,
            authorId: true,
            content: true,
            createdAt: true,
            uniPage: {
                select: { id: true, name: true, slug: true }
            },
            author: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    powerScore: true,
                    createdAt: true,
                    emailVerified: true
                }
            }
        }
    })
}

/**
 * Execute approval transaction atomically
 */
async function executeApprovalTransaction(
    revision: RevisionWithDetails,
    notes?: string
) {
    await prisma.$transaction([
        prisma.wikiRevision.update({
            where: { id: revision.id },
            data: {
                status: 'APPROVED'
            }
        }),
        prisma.uniPage.update({
            where: { id: revision.uniPageId },
            data: {
                content: revision.content,
                published: true
            }
        }),
        prisma.user.update({
            where: { id: revision.authorId },
            data: {
                powerScore: { increment: POWER_SCORE.WIKI_APPROVAL_POINTS }
            }
        })
    ])
}

/**
 * Revalidate paths after approval
 */
async function revalidateAfterApproval(uniPageId: string, slug: string) {
    revalidatePath(`/wiki/${slug}`)
    revalidatePath('/admin/dashboard')
    revalidatePath('/wiki')
}

// ============================================================================
// Bulk Operations
// ============================================================================

interface BulkResult {
    success: string[]
    failed: { id: string; error: string }[]
}

/**
 * Bulk approve wiki revisions - ADMIN ONLY
 */
export async function bulkApproveRevisions(revisionIds: string[], notes?: string): Promise<BulkResult> {
    await requireAdmin()

    const results: BulkResult = { success: [], failed: [] }

    for (const revisionId of revisionIds) {
        try {
            await approveRevision(revisionId, notes)
            results.success.push(revisionId)
        } catch (error) {
            results.failed.push({
                id: revisionId,
                error: error instanceof Error ? error.message : 'Unknown error'
            })
        }
    }

    logger.info('Bulk approve revisions completed', {
        total: revisionIds.length,
        success: results.success.length,
        failed: results.failed.length
    })

    return results
}

/**
 * Bulk reject wiki revisions - ADMIN ONLY
 */
export async function bulkRejectRevisions(
    revisionIds: string[],
    notes?: string,
    reason?: string
): Promise<BulkResult> {
    await requireAdmin()

    const results: BulkResult = { success: [], failed: [] }

    for (const revisionId of revisionIds) {
        try {
            await rejectRevision(revisionId, notes, reason)
            results.success.push(revisionId)
        } catch (error) {
            results.failed.push({
                id: revisionId,
                error: error instanceof Error ? error.message : 'Unknown error'
            })
        }
    }

    logger.info('Bulk reject revisions completed', {
        total: revisionIds.length,
        success: results.success.length,
        failed: results.failed.length
    })

    return results
}

// ============================================================================
// Revision Queries
// ============================================================================

interface RevisionWithPriority {
    priorityScore: number
    authorReputation: {
        score: number
        level: string
        canAutoApprove: boolean
        requiresExtraReview: boolean
    }
}

/**
 * Get pending revisions with moderation info - ADMIN ONLY
 */
export async function getPendingRevisionsWithModerationInfo() {
    await requireAdmin()

    const revisions = await prisma.wikiRevision.findMany({
        where: { status: 'PENDING' },
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    powerScore: true,
                    createdAt: true,
                    emailVerified: true
                }
            },
            uniPage: {
                select: {
                    id: true,
                    name: true,
                    slug: true
                }
            }
        },
        orderBy: [
            { createdAt: 'desc' }
        ]
    })

    // Calculate priority score for each revision
    const revisionsWithPriority = await Promise.all(
        revisions.map(async (revision) => {
            const reputation = await calculateReputation(revision.authorId)

            const priorityScore =
                (reputation.requiresExtraReview ? 20 : 0) +
                (reputation.score < 30 ? 15 : 0)

            return {
                ...revision,
                priorityScore,
                authorReputation: {
                    score: reputation.score,
                    level: reputation.level,
                    canAutoApprove: reputation.canAutoApprove,
                    requiresExtraReview: reputation.requiresExtraReview
                }
            }
        })
    )

    return revisionsWithPriority.sort((a, b) => b.priorityScore - a.priorityScore)
}

// ============================================================================
// Staff Management
// ============================================================================

export async function approveStaff(userId: string, _formData?: FormData) {
    await requireAdmin()
    await prisma.user.update({ where: { id: userId }, data: { role: 'STAFF' } })
    revalidatePath('/admin/dashboard')
    logger.info('Staff approved', { userId })
}

export async function rejectStaff(userId: string, _formData?: FormData) {
    await requireAdmin()
    await prisma.user.update({ where: { id: userId }, data: { role: 'STUDENT' } })
    revalidatePath('/admin/dashboard')
    logger.info('Staff rejected', { userId })
}

// ============================================================================
// Power Score Management
// ============================================================================

export async function incrementPowerScore(userId: string, points: number) {
    await requireAdmin()
    await prisma.user.update({
        where: { id: userId },
        data: { powerScore: { increment: points } }
    })
    logger.info('Power score incremented', { userId, points })
}

export async function recalculatePowerScore(userId: string) {
    await requireAdmin()

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, socialStats: true }
    })

    if (!user) return

    const [referralsCount, approvedEditsCount] = await Promise.all([
        prisma.referral.count({ where: { referrerId: userId } }),
        prisma.wikiRevision.count({
            where: { authorId: userId, status: 'APPROVED' }
        })
    ])

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

    logger.info('Power score recalculated', { userId, powerScore })
}

// ============================================================================
// Page Management
// ============================================================================

export async function deletePage(slug: string) {
    await requireAdmin()

    const page = await prisma.uniPage.findUnique({
        where: { slug },
        select: { id: true, name: true }
    })

    if (!page) return

    // Find creator for notification
    const firstRevision = await prisma.wikiRevision.findFirst({
        where: { uniPageId: page.id },
        orderBy: { createdAt: 'asc' },
        select: { author: { select: { email: true, name: true } } }
    })

    // Send notification async
    if (firstRevision?.author.email) {
        // We use an IIFE to not block the deletion
        const { sendArticleDeleteEmail } = await import('@/lib/email/send')
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        sendArticleDeleteEmail(
            firstRevision.author.email,
            firstRevision.author.name || 'User',
            page.name
        ).catch(err => logger.error('Failed to send delete email', { pageId: page.id }, err))
    }

    await prisma.$transaction([
        prisma.wikiRevision.deleteMany({ where: { uniPageId: page.id } }),
        prisma.uniPage.delete({ where: { id: page.id } })
    ])

    revalidatePath('/wiki')
    redirect('/wiki')
}

// ============================================================================
// Institute Management
// ============================================================================

export async function approveInstitute(id: string, _formData?: FormData) {
    await requireAdmin()
    await prisma.institute.update({ where: { id }, data: { approved: true } })
    revalidatePath('/admin/dashboard')
    revalidatePath('/wiki')
    logger.info('Institute approved', { instituteId: id })
}

export async function rejectInstitute(id: string, _formData?: FormData) {
    await requireAdmin()
    await prisma.institute.delete({ where: { id } })
    revalidatePath('/admin/dashboard')
    logger.info('Institute rejected', { instituteId: id })
}

// ============================================================================
// Lab Management
// ============================================================================

export async function approveLab(id: string, _formData?: FormData) {
    await requireAdmin()
    const lab = await prisma.lab.update({
        where: { id },
        data: { approved: true },
        include: { institute: { select: { slug: true } } }
    })
    revalidatePath('/admin/dashboard')
    revalidatePath(`/wiki/institutes/${lab.institute.slug}`)
    logger.info('Lab approved', { labId: id })
}

export async function rejectLab(id: string, _formData?: FormData) {
    await requireAdmin()
    await prisma.lab.delete({ where: { id } })
    revalidatePath('/admin/dashboard')
    logger.info('Lab rejected', { labId: id })
}

// ============================================================================
// Secondary University Request Management
// ============================================================================

interface SecondaryRequest {
    id: string
    userId: string
    universityId: string
    status: string
}

export async function approveSecondaryUniversityRequest(requestId: string, _formData?: FormData) {
    await requireAdmin()

    const request = await fetchAndValidateSecondaryRequest(requestId)
    await executeSecondaryUniversityApproval(request)

    revalidatePath('/admin/dashboard')
    revalidatePath('/profile')
    logger.info('Secondary university request approved', { requestId, userId: request.userId })
}

export async function rejectSecondaryUniversityRequest(requestId: string, _formData?: FormData) {
    await requireAdmin()

    await prisma.secondaryUniversityRequest.update({
        where: { id: requestId },
        data: { status: 'REJECTED' }
    })

    revalidatePath('/admin/dashboard')
    revalidatePath('/profile')
    logger.info('Secondary university request rejected', { requestId })
}

async function fetchAndValidateSecondaryRequest(requestId: string): Promise<SecondaryRequest> {
    const request = await prisma.secondaryUniversityRequest.findUnique({
        where: { id: requestId },
        select: { id: true, userId: true, universityId: true, status: true }
    })

    if (!request) throw new Error('Request not found')
    if (request.status !== 'PENDING') throw new Error('Request is not pending')

    return request
}

async function executeSecondaryUniversityApproval(request: SecondaryRequest) {
    await prisma.$transaction([
        prisma.user.update({
            where: { id: request.userId },
            data: { secondaryUniversityId: request.universityId }
        }),
        prisma.secondaryUniversityRequest.update({
            where: { id: request.id },
            data: { status: 'APPROVED' }
        })
    ])
}
