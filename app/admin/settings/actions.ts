'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
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
