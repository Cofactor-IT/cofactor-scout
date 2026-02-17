'use server'
import { randomInt } from 'crypto'

import { prisma } from '@/lib/database/prisma'
import { revalidatePath } from 'next/cache'
import { SocialStats } from '@/lib/types'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { socialStatsSchema } from '@/lib/validation/schemas'
import { safeJsonParse, validateSocialStats } from '@/lib/security/sanitization'

function getRandomInt(min: number, max: number): number {
    return randomInt(min, max)
}

/**
 * Sync social media stats for the current authenticated user
 * In production, this would fetch real data from Instagram/TikTok/LinkedIn APIs
 */
export async function syncSocials() {
    // Get current authenticated user
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) {
        throw new Error('Unauthorized')
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    })
    if (!user) return

    // Mock API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Type-safe social stats
    const newStats: SocialStats = {
        instagram: getRandomInt(500, 5000),
        tiktok: getRandomInt(1000, 10000),
        linkedin: getRandomInt(200, 1500)
    }

    // Validate stats before storing
    const validationResult = socialStatsSchema.safeParse(newStats)
    if (!validationResult.success) {
        throw new Error('Invalid social stats format')
    }

    // Update social stats first
    await prisma.user.update({
        where: { id: user.id },
        data: {
            socialStats: validationResult.data as unknown as Record<string, number>
        }
    })

    revalidatePath('/profile')
}

/**
 * Update social stats with validation
 * Use this when receiving stats from external APIs
 */
export async function updateSocialStats(userId: string, stats: unknown) {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF')) {
        throw new Error('Unauthorized')
    }

    // Validate the stats object
    const validationResult = socialStatsSchema.safeParse(stats)
    if (!validationResult.success) {
        const errorMessage = validationResult.error.issues.map((issue: { message: string }) => issue.message).join(', ')
        throw new Error(`Invalid social stats: ${errorMessage}`)
    }

    // Additional validation for prototype pollution
    const jsonValidation = validateSocialStats(stats)
    if (!jsonValidation.isValid) {
        throw new Error(jsonValidation.error)
    }

    await prisma.user.update({
        where: { id: userId },
        data: {
            socialStats: validationResult.data as unknown as Record<string, number>
        }
    })
}

/**
 * Parse and validate social stats from JSON string
 * Use this when receiving stats as JSON from client
 */
export async function parseSocialStats(jsonString: string): Promise<SocialStats> {
    // Safe JSON parsing with prototype pollution protection
    const parseResult = safeJsonParse<Record<string, number>>(jsonString)

    if (!parseResult.success) {
        throw new Error(parseResult.error || 'Invalid JSON format')
    }

    // Validate against schema
    const validationResult = socialStatsSchema.safeParse(parseResult.data)
    if (!validationResult.success) {
        const errorMessage = validationResult.error.issues.map((issue: { message: string }) => issue.message).join(', ')
        throw new Error(`Invalid social stats: ${errorMessage}`)
    }

    return validationResult.data as SocialStats
}
