'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import { revalidatePath } from 'next/cache'
import { recalculatePowerScore } from '@/app/admin/actions'
import { SocialStats } from '@/lib/types'
import { socialConnectSchema } from '@/lib/validation'

/**
 * Save social media username/URL and simulate fetching follower count
 * In production, this would call real APIs (Instagram Graph API, TikTok API, LinkedIn API)
 */
export async function saveSocialApiKeys(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return

    // Extract and validate input
    const rawData = {
        platform: formData.get('platform'),
        username: formData.get('username'),
        followers: formData.get('followers')
    }

    const validationResult = socialConnectSchema.safeParse(rawData)
    if (!validationResult.success) {
        const errors = validationResult.error.issues.map((e: { message: string }) => e.message).join(', ')
        throw new Error(errors)
    }

    const { platform, username, followers } = validationResult.data

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    })

    if (!user) return

    // Get existing stats
    const existingStats = (user.socialStats as SocialStats | null) || {}

    // Save username/URL - follower count is entered by user or left blank for admin verification
    const updatedStats = { ...existingStats }

    switch (platform) {
        case 'instagram':
            updatedStats.instagramUsername = username
            updatedStats.instagram = followers
            break
        case 'tiktok':
            updatedStats.tiktokUsername = username
            updatedStats.tiktok = followers
            break
        case 'linkedin':
            updatedStats.linkedinUrl = username
            updatedStats.linkedin = followers
            break
    }

    // Update user's social stats
    await prisma.user.update({
        where: { id: user.id },
        data: {
            socialStats: updatedStats
        }
    })

    // Recalculate power score with new social data
    await recalculatePowerScore(user.id)

    revalidatePath('/profile')
    revalidatePath('/profile/connect')
    revalidatePath('/leaderboard')
}
