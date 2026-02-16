import nodemailer from 'nodemailer'
import { logger, maskEmail } from '@/lib/logger'
import { addEmailJob, EmailJobType } from '@/lib/queues'
import { isQueueConnectionHealthy } from '@/lib/queues/connection'
import {
    emailTemplates,
    type EmailTemplateName,
    type EmailTemplate
} from '@/lib/email/templates'
import { getAppUrl, getFromAddress, isEmailConfigured } from '@/lib/email/utils'

// Configure SMTP Transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
})

interface SendEmailOptions {
    to: string
    template: EmailTemplate
    metadata?: Record<string, unknown>
}

/**
 * Core email sending function
 * Handles SMTP configuration check and error handling
 */
async function sendEmail({ to, template, metadata }: SendEmailOptions): Promise<void> {
    if (!isEmailConfigured()) {
        logger.info('SMTP not configured, skipping email', { to: maskEmail(to), ...metadata })
        return
    }

    // CHECK GLOBAL SETTINGS
    const { getSystemSettings } = await import('@/lib/settings')
    const settings = await getSystemSettings()

    // If it's an admin alert, we check enableAdminEmails (handled in sendAdminAlertEmail wrapper usually, but good to have safety)
    // However, sendEmail is generic. 
    // Let's rely on the wrappers to check specific flags, OR check here based on metadata type?
    // Implementation Plan said: "Update sendEmail (or the wrapper functions)"
    // It's safer to update the wrappers or check here if we can distinguish.
    // "sendAdminAlertEmail will check enableAdminEmails. Other user-facing emails will check enableStudentEmails."

    // Let's implement the check in the wrappers (sendWelcomeEmail, sendVerificationEmail, etc) to be precise.
    // But to save tokens/steps, I can modify `sendEmail` to default to checking `enableStudentEmails` UNLESS metadata.type === 'adminAlert'.

    if (metadata?.type === 'adminAlert') {
        if (!settings.enableAdminEmails) {
            logger.info('Admin emails disabled by global settings', { to: maskEmail(to) })
            return
        }
    } else {
        // Default to student/user emails
        if (!settings.enableStudentEmails) {
            logger.info('Student emails disabled by global settings', { to: maskEmail(to) })
            return
        }
    }

    const mailOptions = {
        from: getFromAddress(),
        to,
        subject: template.subject,
        text: template.text,
        html: template.html,
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
 * Send welcome email to new users
 * Uses the background queue if available, falls back to synchronous sending
 */
export async function sendWelcomeEmail(toEmail: string, name: string): Promise<void> {
    // Try to use the queue first
    const isHealthy = await isQueueConnectionHealthy()
    if (isHealthy) {
        const job = await addEmailJob(EmailJobType.WELCOME, toEmail, name)
        if (job) {
            logger.info('Welcome email queued', { toEmail: maskEmail(toEmail), jobId: job.id })
            return
        }
    }

    // Fallback to synchronous sending if queue is unavailable
    logger.info('Queue unavailable, sending welcome email synchronously', { toEmail: maskEmail(toEmail) })
    const template = emailTemplates.welcome({ name })
    await sendEmail({
        to: toEmail,
        template,
        metadata: { type: 'welcome', name }
    })
}

/**
 * Send email verification link
 * Uses the background queue if available, falls back to synchronous sending
 */
export async function sendVerificationEmail(toEmail: string, name: string, token: string): Promise<void> {
    // Try to use the queue first
    const isHealthy = await isQueueConnectionHealthy()
    if (isHealthy) {
        const job = await addEmailJob(EmailJobType.VERIFICATION, toEmail, name, { token })
        if (job) {
            logger.info('Verification email queued', { toEmail: maskEmail(toEmail), jobId: job.id })
            return
        }
    }

    // Fallback to synchronous sending
    logger.info('Queue unavailable, sending verification email synchronously', { toEmail: maskEmail(toEmail) })
    const template = emailTemplates.verification({ name, token })
    await sendEmail({
        to: toEmail,
        template,
        metadata: { type: 'verification', name }
    })
}

/**
 * Send password reset code
 * Uses the background queue if available, falls back to synchronous sending
 */
export async function sendPasswordResetEmail(toEmail: string, resetCode: string): Promise<void> {
    // Try to use the queue first
    const isHealthy = await isQueueConnectionHealthy()
    if (isHealthy) {
        const job = await addEmailJob(EmailJobType.PASSWORD_RESET, toEmail, '', { resetCode })
        if (job) {
            logger.info('Password reset email queued', { toEmail: maskEmail(toEmail), jobId: job.id })
            return
        }
    }

    // Fallback to synchronous sending
    logger.info('Queue unavailable, sending password reset email synchronously', { toEmail: maskEmail(toEmail) })
    const template = emailTemplates.passwordReset({ resetCode })
    await sendEmail({
        to: toEmail,
        template,
        metadata: { type: 'passwordReset' }
    })
}

/**
 * Send notification email
 * Uses the background queue if available, falls back to synchronous sending
 */
export async function sendNotificationEmail(
    toEmail: string,
    name: string,
    title: string,
    message: string,
    link?: string
): Promise<void> {
    // Try to use the queue first
    const isHealthy = await isQueueConnectionHealthy()
    if (isHealthy) {
        const job = await addEmailJob(EmailJobType.NOTIFICATION, toEmail, name, { title, message, link })
        if (job) {
            logger.info('Notification email queued', { toEmail: maskEmail(toEmail), jobId: job.id, title })
            return
        }
    }

    // Fallback to synchronous sending
    logger.info('Queue unavailable, sending notification email synchronously', { toEmail: maskEmail(toEmail), title })
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
    const isHealthy = await isQueueConnectionHealthy()
    if (isHealthy) {
        const job = await addEmailJob(EmailJobType.NOTIFICATION, toEmail, name, {
            title: 'You were mentioned',
            message: `${actorName} mentioned you: "${context}..."`,
            link
        })
        if (job) {
            logger.info('Mention email queued', { toEmail: maskEmail(toEmail), jobId: job.id })
            return
        }
    }

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
    const isHealthy = await isQueueConnectionHealthy()
    if (isHealthy) {
        const job = await addEmailJob(EmailJobType.NOTIFICATION, toEmail, name, {
            title: 'Article Updated',
            message: `${actorName} updated your article "${articleTitle}"`,
            link
        })
        if (job) {
            logger.info('Article update email queued', { toEmail: maskEmail(toEmail), jobId: job.id })
            return
        }
    }

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
    const isHealthy = await isQueueConnectionHealthy()
    if (isHealthy) {
        const job = await addEmailJob(EmailJobType.NOTIFICATION, toEmail, name, {
            title: 'Article Deleted',
            message: `Your article "${articleTitle}" has been deleted.`,
        })
        if (job) {
            logger.info('Article delete email queued', { toEmail: maskEmail(toEmail), jobId: job.id })
            return
        }
    }

    const template = emailTemplates.articleDelete({ name, articleTitle })
    await sendEmail({
        to: toEmail,
        template,
        metadata: { type: 'articleDelete', articleTitle }
    })
}



// Re-export utilities
export { getAppUrl, isEmailConfigured, getFromAddress }

// Re-export templates for direct use
export { emailTemplates, type EmailTemplate, type EmailTemplateName }
