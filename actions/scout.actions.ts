/**
 * scout.actions.ts
 * 
 * Server Actions for scout application submission and reminder system.
 * Handles both authenticated and unauthenticated application flows.
 * 
 * Scout applications expire after 30 days, allowing users to reapply.
 * Reminder emails can be sent to team to follow up on pending applications.
 */

'use server'

import { prisma } from '@/lib/database/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { logger } from '@/lib/logger'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Generates a cryptographically secure random token.
 * 
 * @returns 64-character hexadecimal string (32 bytes)
 */
function generateSecureToken(): string {
    return randomBytes(32).toString('hex')
}

/**
 * Splits full name into first and last name components.
 * 
 * @param fullName - User's full name as single string
 * @returns Object with firstName and lastName properties
 */
function splitName(fullName: string): { firstName: string; lastName: string } {
    const parts = fullName.trim().split(/\s+/)
    if (parts.length === 1) {
        return { firstName: parts[0], lastName: '' }
    }
    const firstName = parts[0]
    const lastName = parts.slice(1).join(' ')
    return { firstName, lastName }
}

// ============================================
// CONSTANTS
// ============================================

// Scout applications expire after 30 days, allowing reapplication
const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000
// Minimum time between reminder emails (currently disabled)
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000

// ============================================
// EXPORTED SERVER ACTIONS
// ============================================

/**
 * Sends reminder email to team about pending scout application.
 * Applications older than 30 days are considered expired.
 * No rate limiting on reminders in current implementation.
 * 
 * @returns Success message or error (APPLICATION_EXPIRED if > 30 days)
 * @throws {Error} If database query or email sending fails
 */
export async function sendScoutApplicationReminder(): Promise<{ error?: string; success?: string }> {
    try {
        // Always read userId from session, never from client input
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return { error: 'Not authenticated' }
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                scoutApplicationStatus: true,
                scoutApplicationDate: true,
                fullName: true,
                email: true,
                university: true
            }
        })

        if (!user || user.scoutApplicationStatus !== 'PENDING') {
            return { error: 'No pending application found' }
        }

        if (!user.scoutApplicationDate) {
            return { error: 'Application date not found' }
        }

        const now = Date.now()
        const applicationAge = now - user.scoutApplicationDate.getTime()

        // Check if application is older than 30 days - allow reapplication
        if (applicationAge > ONE_MONTH_MS) {
            return { error: 'APPLICATION_EXPIRED' }
        }

        // Reminder rate limiting removed - users can send reminders anytime

        // Send reminder emails to team (it@cofactor.world, team@cofactor.world)
        const { sendScoutApplicationReminderEmail, sendReminderConfirmationEmail } = await import('@/lib/email/send')
        const daysSinceApplication = Math.floor(applicationAge / (24 * 60 * 60 * 1000))

        try {
            await sendScoutApplicationReminderEmail(
                user.fullName,
                user.email,
                user.university || 'Not specified',
                daysSinceApplication
            )
            await sendReminderConfirmationEmail(user.email, user.fullName)
            logger.info('Scout application reminder sent', { userId: session.user.id })
        } catch (err) {
            logger.error('Failed to send reminder emails', { error: err })
        }

        return { success: 'Reminder sent to team' }
    } catch (error) {
        logger.error('Send reminder failed', { error })
        return { error: 'Failed to send reminder' }
    }
}

/**
 * Submits scout application for authenticated or unauthenticated users.
 * Authenticated users: Updates existing account with application data.
 * Unauthenticated users: Returns data to redirect to signup flow.
 * 
 * Sends confirmation email to applicant and notification to team.
 * 
 * @param prevState - Previous form state (unused, required by useActionState)
 * @param formData - Form data with application fields
 * @returns Success/error message, or REDIRECT_TO_SIGNUP with application data
 * @throws {Error} If database operation fails
 */
export async function submitScoutApplication(
    prevState: { error?: string; success?: string; data?: any } | undefined,
    formData: FormData
): Promise<{ error?: string; success?: string; data?: any }> {
    try {
        const session = await getServerSession(authOptions)

        // Extract form data
        const name = formData.get('name') as string
        // Normalize email to prevent duplicate accounts
        const email = (formData.get('email') as string)?.toLowerCase().trim()
        const university = formData.get('university') as string
        const department = formData.get('department') as string
        const linkedinUrl = formData.get('linkedinUrl') as string | null
        const userRole = formData.get('userRole') as string
        const userRoleOther = formData.get('userRoleOther') as string | null
        const researchAreas = formData.get('researchAreas') as string
        const whyScout = formData.get('whyScout') as string
        const howSourceLeads = formData.get('howSourceLeads') as string

        // Validate required fields
        if (!name || !email || !university || !department || !userRole || !researchAreas || !whyScout || !howSourceLeads) {
            return { error: 'Please fill in all required fields' }
        }

        let userId: string
        let userFullName: string

        if (session?.user?.id) {
            // Authenticated user flow - update existing account
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { scoutApplicationStatus: true, fullName: true }
            })

            if (!user) {
                return { error: 'User not found' }
            }

            if (user.scoutApplicationStatus !== 'NOT_APPLIED') {
                return { error: 'You have already submitted a scout application' }
            }

            userId = session.user.id
            userFullName = user.fullName

            // Update user with scout application data and set status to PENDING
            await prisma.user.update({
                where: { id: userId },
                data: {
                    university,
                    department,
                    linkedinUrl: linkedinUrl || null,
                    userRole: userRole as any,
                    userRoleOther: userRole === 'OTHER' ? userRoleOther : null,
                    researchAreas,
                    whyScout,
                    howSourceLeads,
                    scoutApplicationStatus: 'PENDING',
                    scoutApplicationDate: new Date()
                }
            })
        } else {
            // Unauthenticated user flow - redirect to signup with application data
            const existingUser = await prisma.user.findUnique({
                where: { email },
                select: { id: true }
            })

            if (existingUser) {
                return { error: 'An account with this email already exists. Please sign in first.' }
            }

            // Return application data to be passed to signup page via URL
            return { 
                success: 'REDIRECT_TO_SIGNUP',
                data: {
                    name,
                    email,
                    university,
                    department,
                    linkedinUrl,
                    userRole,
                    userRoleOther,
                    researchAreas,
                    whyScout,
                    howSourceLeads
                }
            }
        }

        // Send confirmation email to applicant
        const { sendScoutApplicationConfirmationEmail, sendScoutApplicationNotificationEmail } = await import('@/lib/email/send')
        try {
            await sendScoutApplicationConfirmationEmail(email, userFullName)
            logger.info('Scout application confirmation email sent', { email })

            // Send notification to team (it@cofactor.world, team@cofactor.world)
            await sendScoutApplicationNotificationEmail(
                userFullName,
                email,
                university,
                department,
                userRole,
                researchAreas,
                new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
            )
            logger.info('Scout application notification sent to team', { email })
        } catch (err) {
            logger.error('Failed to send scout application emails', { email, error: err })
        }

        logger.info('Scout application submitted', { userId, email })

        return { success: 'Application submitted successfully' }
    } catch (error) {
        logger.error('Scout application submission failed', { error })
        return { error: 'Failed to submit application. Please try again.' }
    }
}
