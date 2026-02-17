import { prisma } from '@/lib/database/prisma'
import { getConfig, MODERATION_FEATURES } from './config'
import { logger } from '@/lib/logger'

export interface UserReputation {
    userId: string
    score: number // 0-100
    approvalRate: number // 0-1
    totalSubmissions: number
    approvedSubmissions: number
    rejectedSubmissions: number
    flaggedSubmissions: number
    isTrusted: boolean
    isSuspicious: boolean
    riskLevel: 'low' | 'medium' | 'high'
}

interface ReputationFactors {
    accountAge: number // days
    isVerified: boolean
    approvalHistory: { approved: number; rejected: number }
    recentActivity: number // submissions in last 7 days
    flaggedSubmissions: number
}

export async function getUserReputation(userId: string): Promise<UserReputation> {
    if (!MODERATION_FEATURES.REPUTATION_SYSTEM) {
        return getDefaultReputation(userId)
    }

    try {
        const [user, revisions] = await Promise.all([
            prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    createdAt: true,
                    emailVerified: true
                }
            }),
            prisma.wikiRevision.findMany({
                where: { authorId: userId },
                select: {
                    status: true,
                    createdAt: true
                }
            })
        ])

        if (!user) {
            return getDefaultReputation(userId)
        }

        const factors: ReputationFactors = {
            accountAge: Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
            isVerified: user.emailVerified !== null,
            approvalHistory: {
                approved: revisions.filter(r => r.status === 'APPROVED').length,
                rejected: revisions.filter(r => r.status === 'REJECTED').length
            },
            recentActivity: revisions.filter(r => {
                const daysSinceSubmission = (Date.now() - r.createdAt.getTime()) / (1000 * 60 * 60 * 24)
                return daysSinceSubmission <= 7
            }).length,
            flaggedSubmissions: revisions.filter(r => r.status === 'PENDING').length
        }

        const reputation = calculateReputationScore(userId, factors)

        return reputation
    } catch (error) {
        logger.error('Failed to calculate user reputation', {
            userId,
            error: error instanceof Error ? error.message : String(error)
        })
        return getDefaultReputation(userId)
    }
}

function calculateReputationScore(userId: string, factors: ReputationFactors): UserReputation {
    const config = getConfig()
    let score = 50 // Base score

    // Account age factor (up to 15 points)
    const ageScore = Math.min(15, factors.accountAge / 30) // Full 15 points at 30+ days
    score += ageScore

    // Email verification factor (10 points)
    if (factors.isVerified) {
        score += 10
    }

    // Approval history factor (up to 30 points)
    const totalHistory = factors.approvalHistory.approved + factors.approvalHistory.rejected
    if (totalHistory > 0) {
        const approvalRate = factors.approvalHistory.approved / totalHistory
        const historyScore = Math.floor(approvalRate * 30)
        score += historyScore
    }

    // Recent activity factor (up to 10 points)
    // Normal activity is good, excessive is suspicious
    if (factors.recentActivity > 0 && factors.recentActivity <= 5) {
        score += Math.min(10, factors.recentActivity * 2)
    } else if (factors.recentActivity > 10) {
        // Penalize excessive activity
        score -= 10
    }

    // Normalize score to 0-100 range
    score = Math.max(0, Math.min(100, score))

    // Calculate approval rate
    const approvalRate = totalHistory > 0
        ? factors.approvalHistory.approved / totalHistory
        : 1.0

    // Determine trust level
    const isTrusted = score >= config.autoApproveReputation && approvalRate >= config.trustedUserScore
    const isSuspicious = score <= config.autoFlagReputation && approvalRate < config.suspiciousUserScore

    // Determine risk level
    const riskLevel: 'low' | 'medium' | 'high' =
        score >= 70 ? 'low' :
            score >= 40 ? 'medium' : 'high'

    return {
        userId,
        score,
        approvalRate,
        totalSubmissions: totalHistory,
        approvedSubmissions: factors.approvalHistory.approved,
        rejectedSubmissions: factors.approvalHistory.rejected,
        flaggedSubmissions: factors.flaggedSubmissions,
        isTrusted,
        isSuspicious,
        riskLevel
    }
}

function getDefaultReputation(userId: string): UserReputation {
    return {
        userId,
        score: 50,
        approvalRate: 1.0,
        totalSubmissions: 0,
        approvedSubmissions: 0,
        rejectedSubmissions: 0,
        flaggedSubmissions: 0,
        isTrusted: false,
        isSuspicious: false,
        riskLevel: 'medium'
    }
}

export async function shouldAutoApprove(userId: string): Promise<boolean> {
    const reputation = await getUserReputation(userId)
    return reputation.isTrusted
}

export async function shouldAutoFlag(userId: string): Promise<boolean> {
    const reputation = await getUserReputation(userId)
    return reputation.isSuspicious
}

export function recordSubmissionOutcome(userId: string, status: 'APPROVED' | 'REJECTED'): void {
    if (!MODERATION_FEATURES.REPUTATION_SYSTEM) {
        return
    }

    // In production, you might want to track this in a separate table
    // For now, we'll log it
    logger.info('Submission outcome recorded', { userId, status })
}

export async function getModerationPriority(userId: string): Promise<number> {
    const reputation = await getUserReputation(userId)

    // Priority 0 = lowest (trusted users), 100 = highest (suspicious users)
    if (reputation.isTrusted) {
        return 10
    }

    if (reputation.isSuspicious) {
        return 80
    }

    // Priority based on score
    return Math.max(20, 100 - reputation.score)
}
// Aliases for compatibility with admin/actions.ts
export async function calculateReputation(userId: string) {
    const reputation = await getUserReputation(userId)
    return {
        score: reputation.score,
        level: reputation.riskLevel,
        canAutoApprove: reputation.isTrusted,
        requiresExtraReview: reputation.isSuspicious
    }
}

export async function updateReputationAfterModeration(userId: string, action: 'approved' | 'rejected') {
    return recordSubmissionOutcome(userId, action === 'approved' ? 'APPROVED' : 'REJECTED')
}
