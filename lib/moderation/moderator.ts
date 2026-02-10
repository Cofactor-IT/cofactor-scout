import { detectSpam } from './spam-detector'
import { filterContent } from './content-filter'
import { getUserReputation, shouldAutoApprove, shouldAutoFlag } from './reputation'
import { getConfig } from './config'
import { logger } from '@/lib/logger'

export interface ModerateContentOptions {
    title?: string
    contentType?: 'wiki' | 'comment' | 'user' | 'person'
}

export interface ModerationResult {
    action: 'approve' | 'reject' | 'flag' | 'monitor'
    reason?: string
    spamScore: number
    filterViolations: any[]
    reputation: {
        score: number
        level: string
        canAutoApprove: boolean
        requiresExtraReview: boolean
    }
    needsReview: boolean
}

/**
 * Orchestrates content moderation by combining spam detection, content filtering, and reputation checks.
 */
export async function moderateContent(
    content: string,
    userId: string,
    options?: ModerateContentOptions
): Promise<ModerationResult> {
    const config = getConfig()

    // 1. Run Spam Detection
    // Combine title and content if title provided
    const fullContent = options?.title ? `${options.title}\n\n${content}` : content
    const spamAnalysis = detectSpam(fullContent)

    // 2. Run Content Filtering
    const filterResult = filterContent(fullContent)

    // 3. Check User Reputation
    const reputation = await getUserReputation(userId)

    // Determine action
    let action: ModerationResult['action'] = 'monitor'
    let reason: string | undefined
    let needsReview = false

    // REJECT conditions
    if (spamAnalysis.shouldAutoReject) {
        action = 'reject'
        reason = `Spam detected (Score: ${spamAnalysis.score}). ${spamAnalysis.reasons.join(', ')}`
    } else if (!filterResult.passed) {
        action = 'reject'
        reason = `Content violations: ${filterResult.violations.map(v => v.message).join(', ')}`
    }
    // FLAG conditions
    else if (spamAnalysis.requiresManualReview || reputation.isSuspicious) {
        action = 'flag'
        needsReview = true
        reason = spamAnalysis.requiresManualReview
            ? `Potential spam (Score: ${spamAnalysis.score})`
            : 'Suspicious user reputation'
    } else if (reputation.riskLevel === 'high') {
        action = 'flag'
        needsReview = true
        reason = 'High risk user'
    }
    // APPROVE conditions
    else if (reputation.isTrusted && spamAnalysis.shouldAutoApprove && filterResult.passed) {
        action = 'approve'
    }

    return {
        action,
        reason,
        spamScore: spamAnalysis.score,
        filterViolations: filterResult.violations,
        reputation: {
            score: reputation.score,
            level: reputation.riskLevel,
            canAutoApprove: reputation.isTrusted,
            requiresExtraReview: reputation.isSuspicious
        },
        needsReview
    }
}
