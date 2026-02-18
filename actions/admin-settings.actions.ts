'use server'

import { prisma } from '@/lib/database/prisma'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/session'
import { logger } from '@/lib/logger'

export async function updateNotificationSettings(data: {
    enableEmailNotifications: boolean
    enableInAppNotifications: boolean
}) {
    await requireAdmin()

    try {
        const existing = await prisma.systemSettings.findFirst()

        if (existing) {
            await prisma.systemSettings.update({
                where: { id: existing.id },
                data
            })
        } else {
            await prisma.systemSettings.create({
                data
            })
        }

        revalidatePath('/admin/settings')
        logger.info('Notification settings updated', { data })
        return { success: true }
    } catch (error) {
        logger.error('Failed to update notification settings', error as Error)
        throw new Error('Failed to update settings')
    }
}
