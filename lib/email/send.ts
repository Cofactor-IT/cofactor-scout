/**
 * send.ts
 * 
 * Email sending functions using Nodemailer.
 * Provides template-based email sending with error handling and logging.
 * 
 * All functions check if SMTP is configured before attempting to send.
 * Emails are sent synchronously to ensure delivery before response.
 * 
 * Email types:
 * - Authentication: verification, password reset, welcome
 * - Scout application: confirmation, notification, reminder
 * - Account: update confirmations, sign-in notifications
 * - Admin: alerts and notifications
 */

import nodemailer from 'nodemailer'
import { logger, maskEmail } from '@/lib/logger'
import {
    emailTemplates,
    type EmailTemplateName,
    type EmailTemplate
} from '@/lib/email/templates'
import { getAppUrl, getFromAddress, isEmailConfigured } from '@/lib/email/utils'
import { prisma } from '@/lib/database/prisma'

// Configure SMTP transporter with environment variables
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
})

/**
 * Options for sendEmail function.
 */
interface SendEmailOptions {
    to: string
    template: EmailTemplate
    metadata?: Record<string, unknown>
}

/**
 * Core email sending function with SMTP configuration check.
 * Handles error logging and skips sending if SMTP not configured.
 * 
 * @param to - Recipient email address
 * @param template - Email template with subject, text, and HTML
 * @param metadata - Additional data for logging
 * @throws Error if email sending fails
 */
async function sendEmail({ to, template, metadata }: SendEmailOptions): Promise<void> {
    logger.info('sendEmail called', { to: maskEmail(to), type: metadata?.type })
    
    // Skip if SMTP not configured (development/testing)
    if (!isEmailConfigured()) {
        logger.warn('SMTP not configured, skipping email', { to: maskEmail(to), ...metadata })
        return
    }

    logger.info('SMTP configured, proceeding with email', { to: maskEmail(to) })

    // CHECK GLOBAL SETTINGS - TEMPORARILY DISABLED
    // const { getSystemSettings } = await import('@/lib/settings')
    // const settings = await getSystemSettings()

    // // Check if email notifications are enabled globally
    // if (!settings.enableEmailNotifications) {
    //     logger.info('Email notifications disabled by global settings', { to: maskEmail(to) })
    //     return
    // }

    const mailOptions: Record<string, unknown> = {
        from: getFromAddress(),
        to,
        subject: template.subject,
        text: template.text,
        html: template.html,
    }
    if (template.replyTo) {
        mailOptions.replyTo = template.replyTo
    }

    try {
        await transporter.sendMail(mailOptions)
        logger.info('Email sent successfully', { to: maskEmail(to), subject: template.subject, ...metadata })
    } catch (error) {
        logger.error('Failed to send email', { to: maskEmail(to), subject: template.subject, ...metadata }, error as Error)
        throw error
    }
}

/**
 * Sends welcome email to new users after account creation.
 * 
 * @param toEmail - User's email address
 * @param name - User's full name
 */
export async function sendWelcomeEmail(toEmail: string, name: string): Promise<void> {
    const template = emailTemplates.welcome({ name })
    await sendEmail({
        to: toEmail,
        template,
        metadata: { type: 'welcome', name }
    })
}

/**
 * Sends email verification link with 24-hour expiration.
 * 
 * @param toEmail - User's email address
 * @param name - User's full name
 * @param token - Verification token (64-char hex string)
 */
export async function sendVerificationEmail(toEmail: string, name: string, token: string): Promise<void> {
    const template = emailTemplates.verification({ name, token })
    await sendEmail({
        to: toEmail,
        template,
        metadata: { type: 'verification', name }
    })
}

/**
 * Sends password reset code with 1-hour expiration.
 * 
 * @param toEmail - User's email address
 * @param resetCode - Password reset token
 */
export async function sendPasswordResetEmail(toEmail: string, resetCode: string): Promise<void> {
    const template = emailTemplates.passwordReset({ resetCode })
    await sendEmail({
        to: toEmail,
        template,
        metadata: { type: 'passwordReset' }
    })
}

/**
 * Send notification email
 */
export async function sendNotificationEmail(
    toEmail: string,
    name: string,
    title: string,
    message: string,
    link?: string
): Promise<void> {
    const template = emailTemplates.notification({ name, title, message, link })
    await sendEmail({
        to: toEmail,
        template,
        metadata: { type: 'notification', title }
    })
}

/**
 * Send admin alert email
 * Sends synchronously to ensure delivery
 */
export async function sendAdminAlertEmail(
    actionType: string,
    details: string,
    link: string
): Promise<void> {
    const adminEmail = process.env.ADMIN_EMAIL

    if (!adminEmail) {
        logger.warn('ADMIN_EMAIL not configured, skipping admin alert', { actionType })
        return
    }

    const template = emailTemplates.adminAction({
        actionType,
        details,
        link
    })

    await sendEmail({
        to: adminEmail,
        template,
        metadata: { type: 'adminAlert', actionType }
    })
}

/**
 * Send mention notification
 */
export async function sendMentionEmail(
    toEmail: string,
    name: string,
    actorName: string,
    context: string,
    link: string
): Promise<void> {
    const template = emailTemplates.mention({ name, actorName, context, link })
    await sendEmail({
        to: toEmail,
        template,
        metadata: { type: 'mention', actorName }
    })
}

/**
 * Send article update notification
 */
export async function sendArticleUpdateEmail(
    toEmail: string,
    name: string,
    articleTitle: string,
    actorName: string,
    link: string
): Promise<void> {
    const template = emailTemplates.articleUpdate({ name, articleTitle, actorName, link })
    await sendEmail({
        to: toEmail,
        template,
        metadata: { type: 'articleUpdate', articleTitle }
    })
}

/**
 * Send article deletion notification
 */
export async function sendArticleDeleteEmail(
    toEmail: string,
    name: string,
    articleTitle: string
): Promise<void> {
    const template = emailTemplates.articleDelete({ name, articleTitle })
    await sendEmail({
        to: toEmail,
        template,
        metadata: { type: 'articleDelete', articleTitle }
    })
}

/**
 * Sends scout application notification to team emails.
 * Sent to it@cofactor.world and team@cofactor.world.
 * 
 * @param applicantName - Applicant's full name
 * @param applicantEmail - Applicant's email
 * @param university - University name
 * @param department - Department name
 * @param userRole - Academic/professional role
 * @param researchAreas - Research areas of interest
 * @param applicationDate - Formatted application date
 */
export async function sendScoutApplicationNotificationEmail(
    applicantName: string,
    applicantEmail: string,
    university: string,
    department: string,
    userRole: string,
    researchAreas: string,
    whyScout: string,
    howSourceLeads: string,
    linkedinUrl: string | null,
    applicationDate: string
): Promise<void> {
    const settings = await prisma.systemSettings.findFirst()
    const targetEmail = settings?.scoutNotificationEmail || 'it@cofactor.world'

    // Split by comma if multiple emails are configured
    const teamEmails = targetEmail.split(',').map(e => e.trim()).filter(Boolean)
    if (teamEmails.length === 0) teamEmails.push('it@cofactor.world')

    const template = emailTemplates.scoutApplicationNotification({
        applicantName,
        applicantEmail,
        university,
        department,
        userRole,
        researchAreas,
        whyScout,
        howSourceLeads,
        linkedinUrl,
        applicationDate
    })

    for (const email of teamEmails) {
        await sendEmail({
            to: email,
            template,
            metadata: { type: 'scoutApplicationNotification', applicantEmail }
        })
    }
}

/**
 * Sends reminder about pending scout application to team.
 * Sent to it@cofactor.world and team@cofactor.world.
 * 
 * @param applicantName - Applicant's full name
 * @param applicantEmail - Applicant's email
 * @param university - University name
 * @param daysSinceApplication - Days since application submitted
 */
export async function sendScoutApplicationReminderEmail(
    applicantName: string,
    applicantEmail: string,
    university: string,
    daysSinceApplication: number
): Promise<void> {
    const settings = await prisma.systemSettings.findFirst()
    const targetEmail = settings?.scoutNotificationEmail || 'it@cofactor.world'

    // Split by comma if multiple emails are configured
    const teamEmails = targetEmail.split(',').map(e => e.trim()).filter(Boolean)
    if (teamEmails.length === 0) teamEmails.push('it@cofactor.world')

    const template = emailTemplates.scoutApplicationReminder({
        applicantName,
        applicantEmail,
        university,
        daysSinceApplication
    })

    for (const email of teamEmails) {
        await sendEmail({
            to: email,
            template,
            metadata: { type: 'scoutApplicationReminder', applicantEmail }
        })
    }
}

/**
 * Sends confirmation to applicant that reminder was sent to team.
 * 
 * @param toEmail - Applicant's email address
 * @param name - Applicant's full name
 */
export async function sendReminderConfirmationEmail(
    toEmail: string,
    name: string
): Promise<void> {
    const template = emailTemplates.reminderConfirmation({ name })
    await sendEmail({
        to: toEmail,
        template,
        metadata: { type: 'reminderConfirmation' }
    })
}

/**
 * Sends confirmation email after scout application submission.
 * 
 * @param toEmail - Applicant's email address
 * @param name - Applicant's full name
 */
export async function sendScoutApplicationConfirmationEmail(
    toEmail: string,
    name: string
): Promise<void> {
    const template = emailTemplates.scoutApplicationConfirmation({ name })
    await sendEmail({
        to: toEmail,
        template,
        metadata: { type: 'scoutApplicationConfirmation' }
    })
}

/**
 * Send scout approval notification
 */
export async function sendScoutApprovalEmail(
    toEmail: string,
    name: string
): Promise<void> {
    const template = emailTemplates.scoutApproval({ name })
    await sendEmail({
        to: toEmail,
        template,
        metadata: { type: 'scoutApproval' }
    })
}

/**
 * Send scout rejection notification
 */
export async function sendScoutRejectionEmail(
    toEmail: string,
    name: string,
    feedback?: string
): Promise<void> {
    const template = emailTemplates.scoutRejection({ name, feedback })
    await sendEmail({
        to: toEmail,
        template,
        metadata: { type: 'scoutRejection' }
    })
}

/**
 * Send account update confirmation
 */
export async function sendAccountUpdateEmail(
    toEmail: string,
    name: string,
    changes: string
): Promise<void> {
    const template = emailTemplates.accountUpdate({ name, changes })
    await sendEmail({
        to: toEmail,
        template,
        metadata: { type: 'accountUpdate' }
    })
}

/**
 * Send profile update confirmation
 */
export async function sendProfileUpdateEmail(
    toEmail: string,
    name: string
): Promise<void> {
    const template = emailTemplates.profileUpdate({ name })
    await sendEmail({
        to: toEmail,
        template,
        metadata: { type: 'profileUpdate' }
    })
}

/**
 * Send new sign-in notification
 */
export async function sendNewSignInEmail(
    toEmail: string,
    name: string,
    timestamp: string,
    location?: string
): Promise<void> {
    const template = emailTemplates.newSignIn({ name, timestamp, location })
    await sendEmail({
        to: toEmail,
        template,
        metadata: { type: 'newSignIn' }
    })
}



// Re-export utilities
export { getAppUrl, isEmailConfigured, getFromAddress }

// Re-export templates for direct use
export { emailTemplates, type EmailTemplate, type EmailTemplateName }
