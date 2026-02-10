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
    text: `Hi ${name},\n\nWelcome to Cofactor Club! We're excited to have you join our student ambassador network.\n\nStart referring friends and contributing to the Wiki to climb the leaderboard!\n\nBest,\nThe Cofactor Team`,
    html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #6366f1;">Welcome to Cofactor Club! 🚀</h1>
            <p>Hi ${name},</p>
            <p>We're excited to have you join our student ambassador network.</p>
            <p><strong>Next Steps:</strong></p>
            <ul>
                <li>Share your referral code to earn points.</li>
                <li>Contribute to your university's wiki page.</li>
                <li>Climb the leaderboard!</li>
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

// Template registry for type-safe template access
export const emailTemplates = {
    welcome: welcomeEmailTemplate,
    verification: verificationEmailTemplate,
    passwordReset: passwordResetEmailTemplate,
    notification: notificationEmailTemplate
} as const

export type EmailTemplateName = keyof typeof emailTemplates
