/**
 * Social Stats interface for type-safe social media metrics
 */
export interface SocialStats {
    instagram: number
    tiktok: number
    linkedin: number
}

/**
 * Constants for Power Score calculation
 */
export const POWER_SCORE = {
    REFERRAL_POINTS: 50,
    WIKI_APPROVAL_POINTS: 20,
    SOCIAL_DIVISOR: 100
} as const

/**
 * Helper to safely parse SocialStats from JSON
 */
export function parseSocialStats(data: unknown): SocialStats {
    if (data && typeof data === 'object') {
        const stats = data as Record<string, unknown>
        return {
            instagram: typeof stats.instagram === 'number' ? stats.instagram : 0,
            tiktok: typeof stats.tiktok === 'number' ? stats.tiktok : 0,
            linkedin: typeof stats.linkedin === 'number' ? stats.linkedin : 0
        }
    }
    return { instagram: 0, tiktok: 0, linkedin: 0 }
}

/**
 * Calculate total social reach from stats
 */
export function calculateSocialReach(stats: SocialStats): number {
    return stats.instagram + stats.tiktok + stats.linkedin
}
