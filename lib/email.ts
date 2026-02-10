import nodemailer from 'nodemailer'
import { logger } from './logger'
import { addEmailJob, EmailJobType } from './queues'
import { isQueueConnectionHealthy } from './queues/connection'
import {
    emailTemplates,
    type EmailTemplateName,
    type EmailTemplate
} from './email/templates'
import { getAppUrl, getFromAddress, isEmailConfigured } from './email/utils'

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
        logger.info('SMTP not configured, skipping email', { to, ...metadata })
        return
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
        logger.info('Email sent successfully', { to, subject: template.subject, ...metadata })
    } catch (error) {
        logger.error('Failed to send email', { to, subject: template.subject, ...metadata }, error as Error)
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
            logger.info('Welcome email queued', { toEmail, jobId: job.id })
            return
        }
    }

    // Fallback to synchronous sending if queue is unavailable
    logger.info('Queue unavailable, sending welcome email synchronously', { toEmail })
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
            logger.info('Verification email queued', { toEmail, jobId: job.id })
            return
        }
    }

    // Fallback to synchronous sending
    logger.info('Queue unavailable, sending verification email synchronously', { toEmail })
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
            logger.info('Password reset email queued', { toEmail, jobId: job.id })
            return
        }
    }

    // Fallback to synchronous sending
    logger.info('Queue unavailable, sending password reset email synchronously', { toEmail })
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
            logger.info('Notification email queued', { toEmail, jobId: job.id, title })
            return
        }
    }

    // Fallback to synchronous sending
    logger.info('Queue unavailable, sending notification email synchronously', { toEmail, title })
    const template = emailTemplates.notification({ name, title, message, link })
    await sendEmail({
        to: toEmail,
        template,
        metadata: { type: 'notification', title }
    })
}

// Re-export utilities
export { getAppUrl, isEmailConfigured, getFromAddress }

// Re-export templates for direct use
export { emailTemplates, type EmailTemplate, type EmailTemplateName }
