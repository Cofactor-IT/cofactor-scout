/**
 * Social Stats interface for type-safe social media metrics
 */
export interface SocialStats {
    instagram?: number
    instagramUsername?: string
    tiktok?: number
    tiktokUsername?: string
    linkedin?: number
    linkedinUrl?: string
}



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
    return (stats.instagram || 0) + (stats.tiktok || 0) + (stats.linkedin || 0)
}
