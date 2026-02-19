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
    subject: 'Welcome to Cofactor Scout',
    text: `Hi ${name},\n\nWelcome to Cofactor Scout! We're excited to have you join our network.\n\nContribute research leads and help us connect groundbreaking research with venture capital.\n\nBest,\nThe Cofactor Team`,
    html: `
        <div style="font-family: Arial, sans-serif; color: #1B2A4A; max-width: 600px; margin: 0 auto; background-color: #FAFBFC; padding: 40px 20px;">
            <div style="background-color: #ffffff; border-radius: 4px; padding: 40px; border: 1px solid #E5E7EB;">
                <img src="https://club.cofactor.world/cofactor-scout-navbar-logo.png" alt="Cofactor Scout" style="height: 30px; margin-bottom: 30px;" />
                <h1 style="color: #0D7377; font-size: 28px; margin-bottom: 16px;">Welcome to Cofactor Scout! 🚀</h1>
                <p style="color: #1B2A4A; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">Hi ${name},</p>
                <p style="color: #1B2A4A; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">We're excited to have you join our network. Contribute research leads and help us connect groundbreaking research with venture capital.</p>
                <p style="color: #1B2A4A; font-size: 16px; line-height: 1.6;">Best,<br>The Cofactor Team</p>
            </div>
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
            <div style="font-family: Arial, sans-serif; color: #1B2A4A; max-width: 600px; margin: 0 auto; background-color: #FAFBFC; padding: 40px 20px;">
                <div style="background-color: #ffffff; border-radius: 4px; padding: 40px; border: 1px solid #E5E7EB;">
                    <img src="https://club.cofactor.world/cofactor-scout-navbar-logo.png" alt="Cofactor Scout" style="height: 30px; margin-bottom: 30px;" />
                    <h1 style="color: #0D7377; font-size: 28px; margin-bottom: 16px;">Verify your email address</h1>
                    <p style="color: #1B2A4A; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">Hi ${name},</p>
                    <p style="color: #1B2A4A; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">Please click the button below to verify your email address:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verifyUrl}" style="background-color: #0D7377; color: white; padding: 14px 32px; text-decoration: none; border-radius: 9999px; display: inline-block; font-size: 16px; font-weight: 500;">Verify Email</a>
                    </div>
                    <p style="color: #6B7280; font-size: 14px; line-height: 1.6; margin-bottom: 8px;">Or copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #0D7377; font-size: 14px; margin-bottom: 24px;">${verifyUrl}</p>
                    <p style="color: #6B7280; font-size: 14px; line-height: 1.6;">This link will expire in 24 hours. If you didn't create an account, please ignore this email.</p>
                </div>
            </div>
        `
    }
}

interface PasswordResetEmailData {
    resetCode: string
}

export const passwordResetEmailTemplate: TemplateFn<PasswordResetEmailData> = ({ resetCode }) => {
    const resetUrl = `${getAppUrl()}/auth/reset-password?token=${resetCode}`

    return {
        subject: 'Reset your password',
        text: `Hi,\n\nYou requested to reset your password. Click the link below to set a new password:\n\n${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.\n\nBest,\nThe Cofactor Team`,
        html: `
            <div style="font-family: Arial, sans-serif; color: #1B2A4A; max-width: 600px; margin: 0 auto; background-color: #FAFBFC; padding: 40px 20px;">
                <div style="background-color: #ffffff; border-radius: 4px; padding: 40px; border: 1px solid #E5E7EB;">
                    <img src="https://club.cofactor.world/cofactor-scout-navbar-logo.png" alt="Cofactor Scout" style="height: 30px; margin-bottom: 30px;" />
                    <h1 style="color: #0D7377; font-size: 28px; margin-bottom: 16px;">Reset your password</h1>
                    <p style="color: #1B2A4A; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">You requested to reset your password. Click the button below to set a new password:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" style="background-color: #0D7377; color: white; padding: 14px 32px; text-decoration: none; border-radius: 9999px; display: inline-block; font-size: 16px; font-weight: 500;">Reset Password</a>
                    </div>
                    <p style="color: #6B7280; font-size: 14px; line-height: 1.6; margin-bottom: 8px;">Or copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #0D7377; font-size: 14px; margin-bottom: 24px;">${resetUrl}</p>
                    <p style="color: #6B7280; font-size: 14px; line-height: 1.6;">This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
                </div>
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

interface ScoutApplicationConfirmationData {
    name: string
}

export const scoutApplicationConfirmationTemplate: TemplateFn<ScoutApplicationConfirmationData> = ({ name }) => ({
    subject: 'Scout Application Received',
    text: `Hi ${name},\n\nThank you for applying to become a Cofactor Scout!\n\nWe've received your application and our team will review it shortly. We'll get back to you within 3-5 business days.\n\nIn the meantime, feel free to continue submitting research leads as a contributor.\n\nBest,\nThe Cofactor Team`,
    html: `
        <div style="font-family: Arial, sans-serif; color: #1B2A4A; max-width: 600px; margin: 0 auto; background-color: #FAFBFC; padding: 40px 20px;">
            <div style="background-color: #ffffff; border-radius: 4px; padding: 40px; border: 1px solid #E5E7EB;">
                <img src="https://club.cofactor.world/cofactor-scout-navbar-logo.png" alt="Cofactor Scout" style="height: 30px; margin-bottom: 30px;" />
                <h1 style="color: #0D7377; font-size: 28px; margin-bottom: 16px;">Application Received! 🎯</h1>
                <p style="color: #1B2A4A; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">Hi ${name},</p>
                <p style="color: #1B2A4A; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">Thank you for applying to become a <strong>Cofactor Scout</strong>!</p>
                <p style="color: #1B2A4A; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">We've received your application and our team will review it shortly. We'll get back to you within <strong>3-5 business days</strong>.</p>
                <p style="color: #1B2A4A; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">In the meantime, feel free to continue submitting research leads as a contributor.</p>
                <p style="color: #1B2A4A; font-size: 16px; line-height: 1.6;">Best,<br>The Cofactor Team</p>
            </div>
        </div>
    `
})

interface ScoutApprovalData {
    name: string
}

export const scoutApprovalTemplate: TemplateFn<ScoutApprovalData> = ({ name }) => ({
    subject: 'Welcome to the Scout Network!',
    text: `Hi ${name},\n\nCongratulations! Your application to become a Cofactor Scout has been approved.\n\nYou now have access to scout features and can start earning rewards for quality research leads.\n\nSign in to your dashboard to get started: ${getAppUrl()}/dashboard\n\nBest,\nThe Cofactor Team`,
    html: `
        <div style="font-family: Arial, sans-serif; color: #1B2A4A; max-width: 600px; margin: 0 auto; background-color: #FAFBFC; padding: 40px 20px;">
            <div style="background-color: #ffffff; border-radius: 4px; padding: 40px; border: 1px solid #E5E7EB;">
                <img src="https://club.cofactor.world/cofactor-scout-navbar-logo.png" alt="Cofactor Scout" style="height: 30px; margin-bottom: 30px;" />
                <h1 style="color: #2D7D46; font-size: 28px; margin-bottom: 16px;">Welcome to the Scout Network! 🚀</h1>
                <p style="color: #1B2A4A; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">Hi ${name},</p>
                <p style="color: #1B2A4A; font-size: 16px; line-height: 1.6; margin-bottom: 16px;"><strong>Congratulations!</strong> Your application to become a Cofactor Scout has been approved.</p>
                <p style="color: #1B2A4A; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">You now have access to scout features and can start earning rewards for quality research leads.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${getAppUrl()}/dashboard" style="background-color: #0D7377; color: white; padding: 14px 32px; text-decoration: none; border-radius: 9999px; display: inline-block; font-size: 16px; font-weight: 500;">Go to Dashboard</a>
                </div>
                <p style="color: #1B2A4A; font-size: 16px; line-height: 1.6;">Best,<br>The Cofactor Team</p>
            </div>
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
    articleDelete: articleDeleteNotificationTemplate,
    scoutApplicationConfirmation: scoutApplicationConfirmationTemplate,
    scoutApproval: scoutApprovalTemplate
} as const



export type EmailTemplateName = keyof typeof emailTemplates
