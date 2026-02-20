'use server'

import { prisma } from '@/lib/database/prisma'
import { requireAdmin } from '@/lib/auth/session'
import { logger } from '@/lib/logger'
import { sendScoutApprovalEmail, sendScoutRejectionEmail } from '@/lib/email/send'

export async function approveScoutApplication(userId: string): Promise<{ success?: boolean; error?: string }> {
    try {
        const admin = await requireAdmin()

        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (!user || user.scoutApplicationStatus !== 'PENDING') {
            return { error: 'Application not found or not pending.' }
        }

        await prisma.user.update({
            where: { id: userId },
            data: {
                role: 'SCOUT',
                scoutApplicationStatus: 'APPROVED',
                scoutApprovedAt: new Date()
            }
        })

        try {
            await sendScoutApprovalEmail(user.email, user.fullName)
            logger.info('Scout approval email sent', { email: user.email })
        } catch (err) {
            logger.error('Failed to send scout approval email', { error: err })
        }

        logger.info('Scout application approved', { adminId: admin.id, applicantId: userId })
        return { success: true }
    } catch (e: any) {
        logger.error('Failed to approve scout application', { error: e })
        return { error: e.message || 'Error approving application' }
    }
}

export async function rejectScoutApplication(userId: string, feedback?: string): Promise<{ success?: boolean; error?: string }> {
    try {
        const admin = await requireAdmin()

        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (!user || user.scoutApplicationStatus !== 'PENDING') {
            return { error: 'Application not found or not pending.' }
        }

        await prisma.user.update({
            where: { id: userId },
            data: {
                scoutApplicationStatus: 'REJECTED'
            }
        })

        try {
            await sendScoutRejectionEmail(user.email, user.fullName, feedback)
            logger.info('Scout rejection email sent', { email: user.email })
        } catch (err) {
            logger.error('Failed to send scout rejection email', { error: err })
        }

        logger.info('Scout application rejected', { adminId: admin.id, applicantId: userId })
        return { success: true }
    } catch (e: any) {
        logger.error('Failed to reject scout application', { error: e })
        return { error: e.message || 'Error rejecting application' }
    }
}
