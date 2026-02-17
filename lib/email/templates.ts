/**
 * Email template definitions
 * Separates email content from sending logic
 */

function getAppUrl(): string {
    return process.env.NEXTAUTH_URL || process.env.APP_URL || 'http://localhost:3000'
}

export interface EmailTemplate {
    subject: string
    text: string
    html: string
}

type TemplateFn<T = Record<string, unknown>> = (data: T) => EmailTemplate

interface WelcomeEmailData {
    name: string
}

export const welcomeEmailTemplate: TemplateFn<WelcomeEmailData> = ({ name }) => ({
    subject: 'Welcome to Cofactor Club',
    text: `Hi ${name},\n\nWelcome to Cofactor Club! We're excited to have you join our student ambassador network.\n\nStart referring friends and contributing to the Wiki!\n\nBest,\nThe Cofactor Team`,
    html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #6366f1;">Welcome to Cofactor Club! 🚀</h1>
            <p>Hi ${name},</p>
            <p>We're excited to have you join our student ambassador network.</p>
            <p><strong>Next Steps:</strong></p>
            <ul>
                <li>Share your referral code to earn points.</li>
                <li>Contribute to your university's wiki page.</li>

            </ul>
            <p>Best,<br>The Cofactor Team</p>
        </div>
    `
})

interface VerificationEmailData {
    name: string
    token: string
}

export const verificationEmailTemplate: TemplateFn<VerificationEmailData> = ({ name, token }) => {
    const verifyUrl = `${getAppUrl()}/auth/verify?token=${token}`

    return {
        subject: 'Verify your email address',
        text: `Hi ${name},\n\nPlease verify your email address by clicking the link below:\n\n${verifyUrl}\n\nThis link will expire in 24 hours.\n\nIf you didn't create an account, please ignore this email.\n\nBest,\nThe Cofactor Team`,
        html: `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #6366f1;">Verify your email address</h1>
                <p>Hi ${name},</p>
                <p>Please click the button below to verify your email address:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verifyUrl}" style="background-color: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify Email</a>
                </div>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #6366f1;">${verifyUrl}</p>
                <p style="color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
                <p style="color: #666; font-size: 14px;">If you didn't create an account, please ignore this email.</p>
                <p>Best,<br>The Cofactor Team</p>
            </div>
        `
    }
}

interface PasswordResetEmailData {
    resetCode: string
}

export const passwordResetEmailTemplate: TemplateFn<PasswordResetEmailData> = ({ resetCode }) => {
    const resetUrl = `${getAppUrl()}/auth/reset-password`

    return {
        subject: 'Reset your password',
        text: `Hi,\n\nYou requested to reset your password. Use the code below to set a new password:\n\nReset Code: ${resetCode}\n\nGo to: ${resetUrl}\n\nThis code will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.\n\nBest,\nThe Cofactor Team`,
        html: `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #6366f1;">Reset your password</h1>
                <p>You requested to reset your password. Use the code below to set a new password:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; display: inline-block;">
                        <span style="font-size: 32px; letter-spacing: 8px; font-weight: bold; color: #6366f1;">${resetCode}</span>
                    </div>
                </div>
                <p>Go to <a href="${resetUrl}" style="color: #6366f1;">this page</a> and enter the code.</p>
                <p style="color: #666; font-size: 14px;">This code will expire in 1 hour.</p>
                <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
                <p>Best,<br>The Cofactor Team</p>
            </div>
        `
    }
}

interface NotificationEmailData {
    name: string
    title: string
    message: string
    link?: string
}

interface AdminActionEmailData {
    adminName?: string
    actionType: string
    details: string
    link: string
}

export const adminActionRequiredTemplate: TemplateFn<AdminActionEmailData> = ({ adminName = 'Admin', actionType, details, link }) => ({
    subject: `Action Required: ${actionType}`,
    text: `Hi ${adminName},\n\nA new action requires your attention: ${actionType}\n\nDetails: ${details}\n\nView Request: ${getAppUrl()}${link}\n\nBest,\nThe Cofactor System`,
    html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #6366f1;">Action Required: ${actionType}</h1>
            <p>Hi ${adminName},</p>
            <p>A new action requires your attention.</p>
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 0; font-weight: bold;">${details}</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${getAppUrl()}${link}" style="background-color: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">View Request</a>
            </div>
            <p>Best,<br>The Cofactor System</p>
        </div>
    `
})


export const notificationEmailTemplate: TemplateFn<NotificationEmailData> = ({ name, title, message, link }) => ({
    subject: title,
    text: `Hi ${name},\n\n${message}\n\n${link ? `View details: ${getAppUrl()}${link}` : ''}\n\nBest,\nThe Cofactor Team`,
    html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #6366f1;">${title}</h1>
            <p>Hi ${name},</p>
            <p>${message}</p>
            ${link ? `
            <div style="text-align: center; margin: 30px 0;">
                <a href="${getAppUrl()}${link}" style="background-color: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">View Details</a>
            </div>
            ` : ''}
            <p>Best,<br>The Cofactor Team</p>
        </div>
    `
})

interface MentionEmailData {
    name: string
    actorName: string
    context: string
    link: string
}

export const mentionNotificationTemplate: TemplateFn<MentionEmailData> = ({ name, actorName, context, link }) => ({
    subject: `You were mentioned in a Wiki article`,
    text: `Hi ${name},\n\n${actorName} mentioned you in an article:\n\n"${context}..."\n\nView here: ${getAppUrl()}${link}\n\nBest,\nThe Cofactor Team`,
    html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #6366f1;">New Mention</h1>
            <p>Hi ${name},</p>
            <p><strong>${actorName}</strong> mentioned you in a Wiki article:</p>
            <blockquote style="border-left: 4px solid #e5e7eb; padding-left: 15px; font-style: italic; color: #4b5563;">
                "${context}..."
            </blockquote>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${getAppUrl()}${link}" style="background-color: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">View Mention</a>
            </div>
            <p>Best,<br>The Cofactor Team</p>
        </div>
    `
})

interface ArticleUpdateEmailData {
    name: string
    articleTitle: string
    actorName: string
    link: string
}

export const articleUpdateNotificationTemplate: TemplateFn<ArticleUpdateEmailData> = ({ name, articleTitle, actorName, link }) => ({
    subject: `Your article "${articleTitle}" was updated`,
    text: `Hi ${name},\n\n${actorName} just edited an article you created: "${articleTitle}".\n\nView changes: ${getAppUrl()}${link}\n\nBest,\nThe Cofactor Team`,
    html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #6366f1;">Article Updated</h1>
            <p>Hi ${name},</p>
            <p><strong>${actorName}</strong> just edited an article you created:</p>
            <h2 style="font-size: 18px; color: #111;">${articleTitle}</h2>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${getAppUrl()}${link}" style="background-color: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">View Article</a>
            </div>
            <p>Best,<br>The Cofactor Team</p>
        </div>
    `
})

interface ArticleDeleteEmailData {
    name: string
    articleTitle: string
}

export const articleDeleteNotificationTemplate: TemplateFn<ArticleDeleteEmailData> = ({ name, articleTitle }) => ({
    subject: `Your article "${articleTitle}" was deleted`,
    text: `Hi ${name},\n\nYour article "${articleTitle}" has been deleted by an administrator.\n\nIf you believe this was a mistake, please contact support.\n\nBest,\nThe Cofactor Team`,
    html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #ef4444;">Article Deleted</h1>
            <p>Hi ${name},</p>
            <p>Your article <strong>"${articleTitle}"</strong> has been deleted by an administrator.</p>
            <p>If you believe this was a mistake, please contact support.</p>
            <p>Best,<br>The Cofactor Team</p>
        </div>
    `
})

// Template registry for type-safe template access
export const emailTemplates = {
    welcome: welcomeEmailTemplate,
    verification: verificationEmailTemplate,
    passwordReset: passwordResetEmailTemplate,
    notification: notificationEmailTemplate,
    adminAction: adminActionRequiredTemplate,
    mention: mentionNotificationTemplate,
    articleUpdate: articleUpdateNotificationTemplate,
    articleDelete: articleDeleteNotificationTemplate
} as const



export type EmailTemplateName = keyof typeof emailTemplates
