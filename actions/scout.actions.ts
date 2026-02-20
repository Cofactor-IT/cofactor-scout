'use server'

import { prisma } from '@/lib/database/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { logger } from '@/lib/logger'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'

function generateSecureToken(): string {
    return randomBytes(32).toString('hex')
}

function splitName(fullName: string): { firstName: string; lastName: string } {
    const parts = fullName.trim().split(/\s+/)
    if (parts.length === 1) {
        return { firstName: parts[0], lastName: '' }
    }
    const firstName = parts[0]
    const lastName = parts.slice(1).join(' ')
    return { firstName, lastName }
}

const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000

export async function sendScoutApplicationReminder(): Promise<{ error?: string; success?: string }> {
    try {
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

        // Check if application is older than 1 month - allow reapplication
        if (applicationAge > ONE_MONTH_MS) {
            return { error: 'APPLICATION_EXPIRED' }
        }

        // Check if reminder was sent in the last week - removed for now
        // Always allow sending reminder

        // Send reminder to team
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

export async function submitScoutApplication(
    prevState: { error?: string; success?: string } | undefined,
    formData: FormData
): Promise<{ error?: string; success?: string }> {
    try {
        const session = await getServerSession(authOptions)

        // Extract form data
        const name = formData.get('name') as string
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
            // User is logged in
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
        } else {
            // User is not logged in - create account
            const existingUser = await prisma.user.findUnique({
                where: { email },
                select: { id: true }
            })

            if (existingUser) {
                return { error: 'An account with this email already exists. Please sign in first.' }
            }

            // Generate temporary password
            const tempPassword = randomBytes(16).toString('hex')
            const hashedPassword = await bcrypt.hash(tempPassword, 10)
            const verificationToken = generateSecureToken()
            const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)
            const { firstName, lastName } = splitName(name)

            const newUser = await prisma.user.create({
                data: {
                    email,
                    fullName: name,
                    firstName,
                    lastName,
                    password: hashedPassword,
                    role: 'CONTRIBUTOR',
                    verificationToken,
                    verificationExpires,
                    university
                },
                select: { id: true }
            })

            userId = newUser.id
            userFullName = name

            // Send verification email
            const { sendVerificationEmail } = await import('@/lib/email/send')
            try {
                await sendVerificationEmail(email, name, verificationToken)
            } catch (err) {
                logger.error('Failed to send verification email', { email, error: err })
            }
        }

        // Update user with scout application
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

        // Send confirmation email
        const { sendScoutApplicationConfirmationEmail, sendScoutApplicationNotificationEmail } = await import('@/lib/email/send')
        try {
            await sendScoutApplicationConfirmationEmail(email, userFullName)
            logger.info('Scout application confirmation email sent', { email })

            // Send notification to team
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
