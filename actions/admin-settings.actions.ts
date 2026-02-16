'use server'

import { prisma } from '@/lib/database/prisma'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/session'
import { logger } from '@/lib/logger'

/**
 * Add a new staff domain - ADMIN ONLY
 */
export async function addStaffDomain(prevState: { error?: string; success?: string } | undefined, formData: FormData) {
    await requireAdmin()

    const domain = formData.get('domain') as string

    if (!domain) {
        return { error: 'Domain is required' }
    }

    const cleanDomain = domain.toLowerCase().trim()

    try {
        await prisma.staffDomain.create({
            data: { domain: cleanDomain }
        })
        revalidatePath('/admin/settings')
        logger.info('Staff domain added', { domain: cleanDomain })
        return { success: 'Domain added successfully' }
    } catch (e) {
        logger.error('Failed to add staff domain', { error: e })
        return { error: 'Failed to add domain. It might already exist.' }
    }
}

/**
 * Remove a staff domain - ADMIN ONLY
 */
export async function removeStaffDomain(id: string) {
    await requireAdmin()

    try {
        await prisma.staffDomain.delete({
            where: { id }
        })
        revalidatePath('/admin/settings')
        logger.info('Staff domain removed', { id })
    } catch (e) {
        logger.error('Failed to remove staff domain', { error: e })
    }
}

export async function updateNotificationSettings(data: {
    enableStudentEmails: boolean
    enableAdminEmails: boolean
    enableInAppNotifications: boolean
}) {
    await requireAdmin()

    try {
        // Update the first found settings record, or create if missing
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

export async function updateTrustedUserSettings(limit: number) {
    await requireAdmin()

    try {
        const existing = await prisma.systemSettings.findFirst()

        if (existing) {
            await prisma.systemSettings.update({
                where: { id: existing.id },
                data: { trustedUserDailyLimit: limit }
            })
        } else {
            await prisma.systemSettings.create({
                data: { trustedUserDailyLimit: limit }
            })
        }

        revalidatePath('/admin/settings')
        logger.info('Trusted user settings updated', { limit })
        return { success: true }
    } catch (error) {
        logger.error('Failed to update trusted user settings', error as Error)
        throw new Error('Failed to update settings')
    }
}
