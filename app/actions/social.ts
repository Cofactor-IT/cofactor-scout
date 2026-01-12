'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { SocialStats } from '@/lib/types'
import { recalculatePowerScore } from '@/app/admin/actions'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"

function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min)) + min
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

    // Update social stats first
    await prisma.user.update({
        where: { id: user.id },
        data: {
            socialStats: newStats as unknown as Record<string, number>
        }
    })

    // Social stats changed, so recalculate full power score
    // This is one of the few cases where full recalculation is needed
    await recalculatePowerScore(user.id)

    revalidatePath('/profile')
    revalidatePath('/leaderboard')
}
