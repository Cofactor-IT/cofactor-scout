import nodemailer from 'nodemailer'
import { logger, maskEmail } from '@/lib/logger'
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
    logger.info('sendEmail called', { to: maskEmail(to), type: metadata?.type })
    
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
 * Send email verification link
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
 * Send password reset code
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
 * Send scout application notification to team
 */
export async function sendScoutApplicationNotificationEmail(
    applicantName: string,
    applicantEmail: string,
    university: string,
    department: string,
    userRole: string,
    researchAreas: string,
    applicationDate: string
): Promise<void> {
    const teamEmails = ['it@cofactor.world', 'team@cofactor.world']
    const template = emailTemplates.scoutApplicationNotification({
        applicantName,
        applicantEmail,
        university,
        department,
        userRole,
        researchAreas,
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
 * Send scout application reminder to team
 */
export async function sendScoutApplicationReminderEmail(
    applicantName: string,
    applicantEmail: string,
    university: string,
    daysSinceApplication: number
): Promise<void> {
    const teamEmails = ['it@cofactor.world', 'team@cofactor.world']
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
 * Send reminder confirmation to applicant
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
 * Send scout application confirmation
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
