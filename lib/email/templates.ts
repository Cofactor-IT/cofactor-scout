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
                <img src="${getAppUrl()}/cofactor-scout-navbar-logo.png" alt="Cofactor Scout" style="height: 30px; margin-bottom: 30px; display: block;" />
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
                    <img src="${getAppUrl()}/cofactor-scout-navbar-logo.png" alt="Cofactor Scout" style="height: 30px; margin-bottom: 30px; display: block;" />
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
                    <img src="${getAppUrl()}/cofactor-scout-navbar-logo.png" alt="Cofactor Scout" style="height: 30px; margin-bottom: 30px; display: block;" />
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
        <div style="font-family: Arial, sans-serif; color: #1B2A4A; max-width: 600px; margin: 0 auto; background-color: #FAFBFC; padding: 40px 20px;">
            <div style="background-color: #ffffff; border-radius: 4px; padding: 40px; border: 1px solid #E5E7EB;">
                <img src="${getAppUrl()}/cofactor-scout-navbar-logo.png" alt="Cofactor Scout" style="height: 30px; margin-bottom: 30px; display: block;" />
                <h1 style="color: #6366f1; font-size: 28px; margin-bottom: 16px;">Action Required: ${actionType}</h1>
            <p>Hi ${adminName},</p>
            <p>A new action requires your attention.</p>
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 0; font-weight: bold;">${details}</p>
            </div>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${getAppUrl()}${link}" style="background-color: #6366f1; color: white; padding: 14px 32px; text-decoration: none; border-radius: 9999px; display: inline-block; font-size: 16px; font-weight: 500;">View Request</a>
                </div>
                <p style="color: #1B2A4A; font-size: 16px; line-height: 1.6;">Best,<br>The Cofactor System</p>
            </div>
        </div>
    `
})


export const notificationEmailTemplate: TemplateFn<NotificationEmailData> = ({ name, title, message, link }) => ({
    subject: title,
    text: `Hi ${name},\n\n${message}\n\n${link ? `View details: ${getAppUrl()}${link}` : ''}\n\nBest,\nThe Cofactor Team`,
    html: `
        <div style="font-family: Arial, sans-serif; color: #1B2A4A; max-width: 600px; margin: 0 auto; background-color: #FAFBFC; padding: 40px 20px;">
            <div style="background-color: #ffffff; border-radius: 4px; padding: 40px; border: 1px solid #E5E7EB;">
                <img src="${getAppUrl()}/cofactor-scout-navbar-logo.png" alt="Cofactor Scout" style="height: 30px; margin-bottom: 30px; display: block;" />
                <h1 style="color: #6366f1; font-size: 28px; margin-bottom: 16px;">${title}</h1>
            <p>Hi ${name},</p>
            <p>${message}</p>
                ${link ? `
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${getAppUrl()}${link}" style="background-color: #6366f1; color: white; padding: 14px 32px; text-decoration: none; border-radius: 9999px; display: inline-block; font-size: 16px; font-weight: 500;">View Details</a>
                </div>
                ` : ''}
                <p style="color: #1B2A4A; font-size: 16px; line-height: 1.6;">Best,<br>The Cofactor Team</p>
            </div>
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
        <div style="font-family: Arial, sans-serif; color: #1B2A4A; max-width: 600px; margin: 0 auto; background-color: #FAFBFC; padding: 40px 20px;">
            <div style="background-color: #ffffff; border-radius: 4px; padding: 40px; border: 1px solid #E5E7EB;">
                <img src="${getAppUrl()}/cofactor-scout-navbar-logo.png" alt="Cofactor Scout" style="height: 30px; margin-bottom: 30px; display: block;" />
                <h1 style="color: #6366f1; font-size: 28px; margin-bottom: 16px;">New Mention</h1>
            <p>Hi ${name},</p>
            <p><strong>${actorName}</strong> mentioned you in a Wiki article:</p>
            <blockquote style="border-left: 4px solid #e5e7eb; padding-left: 15px; font-style: italic; color: #4b5563;">
                "${context}..."
            </blockquote>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${getAppUrl()}${link}" style="background-color: #6366f1; color: white; padding: 14px 32px; text-decoration: none; border-radius: 9999px; display: inline-block; font-size: 16px; font-weight: 500;">View Mention</a>
                </div>
                <p style="color: #1B2A4A; font-size: 16px; line-height: 1.6;">Best,<br>The Cofactor Team</p>
            </div>
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
        <div style="font-family: Arial, sans-serif; color: #1B2A4A; max-width: 600px; margin: 0 auto; background-color: #FAFBFC; padding: 40px 20px;">
            <div style="background-color: #ffffff; border-radius: 4px; padding: 40px; border: 1px solid #E5E7EB;">
                <img src="${getAppUrl()}/cofactor-scout-navbar-logo.png" alt="Cofactor Scout" style="height: 30px; margin-bottom: 30px; display: block;" />
                <h1 style="color: #6366f1; font-size: 28px; margin-bottom: 16px;">Article Updated</h1>
            <p>Hi ${name},</p>
            <p><strong>${actorName}</strong> just edited an article you created:</p>
            <h2 style="font-size: 18px; color: #111;">${articleTitle}</h2>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${getAppUrl()}${link}" style="background-color: #6366f1; color: white; padding: 14px 32px; text-decoration: none; border-radius: 9999px; display: inline-block; font-size: 16px; font-weight: 500;">View Article</a>
                </div>
                <p style="color: #1B2A4A; font-size: 16px; line-height: 1.6;">Best,<br>The Cofactor Team</p>
            </div>
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
        <div style="font-family: Arial, sans-serif; color: #1B2A4A; max-width: 600px; margin: 0 auto; background-color: #FAFBFC; padding: 40px 20px;">
            <div style="background-color: #ffffff; border-radius: 4px; padding: 40px; border: 1px solid #E5E7EB;">
                <img src="${getAppUrl()}/cofactor-scout-navbar-logo.png" alt="Cofactor Scout" style="height: 30px; margin-bottom: 30px; display: block;" />
                <h1 style="color: #ef4444; font-size: 28px; margin-bottom: 16px;">Article Deleted</h1>
            <p>Hi ${name},</p>
            <p>Your article <strong>"${articleTitle}"</strong> has been deleted by an administrator.</p>
                <p style="color: #1B2A4A; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">If you believe this was a mistake, please contact support.</p>
                <p style="color: #1B2A4A; font-size: 16px; line-height: 1.6;">Best,<br>The Cofactor Team</p>
            </div>
        </div>
    `
})

interface ScoutApplicationNotificationData {
    applicantName: string
    applicantEmail: string
    university: string
    department: string
    userRole: string
    researchAreas: string
    applicationDate: string
}

export const scoutApplicationNotificationTemplate: TemplateFn<ScoutApplicationNotificationData> = ({ applicantName, applicantEmail, university, department, userRole, researchAreas, applicationDate }) => ({
    subject: 'New Scout Application Received',
    text: `New Scout Application\n\nApplicant: ${applicantName}\nEmail: ${applicantEmail}\nUniversity: ${university}\nDepartment: ${department}\nRole: ${userRole}\nResearch Areas: ${researchAreas}\nSubmitted: ${applicationDate}\n\nReview the application in the admin dashboard.`,
    html: `
        <div style="font-family: Arial, sans-serif; color: #1B2A4A; max-width: 600px; margin: 0 auto; background-color: #FAFBFC; padding: 40px 20px;">
            <div style="background-color: #ffffff; border-radius: 4px; padding: 40px; border: 1px solid #E5E7EB;">
                <img src="${getAppUrl()}/cofactor-scout-navbar-logo.png" alt="Cofactor Scout" style="height: 30px; margin-bottom: 30px; display: block;" />
                <h1 style="color: #0D7377; font-size: 28px; margin-bottom: 16px;">New Scout Application 🎯</h1>
                <p style="color: #1B2A4A; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">A new scout application has been submitted and requires review.</p>
                <div style="background-color: #FAFBFC; padding: 20px; border-radius: 4px; margin: 24px 0;">
                    <p style="margin: 8px 0;"><strong>Applicant:</strong> ${applicantName}</p>
                    <p style="margin: 8px 0;"><strong>Email:</strong> ${applicantEmail}</p>
                    <p style="margin: 8px 0;"><strong>University:</strong> ${university}</p>
                    <p style="margin: 8px 0;"><strong>Department:</strong> ${department}</p>
                    <p style="margin: 8px 0;"><strong>Role:</strong> ${userRole}</p>
                    <p style="margin: 8px 0;"><strong>Research Areas:</strong> ${researchAreas}</p>
                    <p style="margin: 8px 0;"><strong>Submitted:</strong> ${applicationDate}</p>
                </div>
                <p style="color: #1B2A4A; font-size: 16px; line-height: 1.6;">Best,<br>The Cofactor System</p>
            </div>
        </div>
    `
})

interface ScoutApplicationReminderData {
    applicantName: string
    applicantEmail: string
    university: string
    daysSinceApplication: number
}

export const scoutApplicationReminderTemplate: TemplateFn<ScoutApplicationReminderData> = ({ applicantName, applicantEmail, university, daysSinceApplication }) => ({
    subject: 'Scout Application Reminder',
    text: `Scout Application Reminder\n\nApplicant: ${applicantName}\nEmail: ${applicantEmail}\nUniversity: ${university}\nDays since application: ${daysSinceApplication}\n\nThis applicant is requesting a status update on their pending scout application.`,
    html: `
        <div style="font-family: Arial, sans-serif; color: #1B2A4A; max-width: 600px; margin: 0 auto; background-color: #FAFBFC; padding: 40px 20px;">
            <div style="background-color: #ffffff; border-radius: 4px; padding: 40px; border: 1px solid #E5E7EB;">
                <img src="${getAppUrl()}/cofactor-scout-navbar-logo.png" alt="Cofactor Scout" style="height: 30px; margin-bottom: 30px; display: block;" />
                <h1 style="color: #F59E0B; font-size: 28px; margin-bottom: 16px;">Scout Application Reminder 🔔</h1>
                <p style="color: #1B2A4A; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">An applicant is requesting a status update on their pending scout application.</p>
                <div style="background-color: #FEF3C7; padding: 20px; border-radius: 4px; margin: 24px 0; border-left: 4px solid #F59E0B;">
                    <p style="margin: 8px 0;"><strong>Applicant:</strong> ${applicantName}</p>
                    <p style="margin: 8px 0;"><strong>Email:</strong> ${applicantEmail}</p>
                    <p style="margin: 8px 0;"><strong>University:</strong> ${university}</p>
                    <p style="margin: 8px 0;"><strong>Days since application:</strong> ${daysSinceApplication}</p>
                </div>
                <p style="color: #1B2A4A; font-size: 16px; line-height: 1.6;">Best,<br>The Cofactor System</p>
            </div>
        </div>
    `
})

interface ReminderConfirmationData {
    name: string
}

export const reminderConfirmationTemplate: TemplateFn<ReminderConfirmationData> = ({ name }) => ({
    subject: 'Reminder Sent to Team',
    text: `Hi ${name},\n\nWe've sent a reminder to our team about your pending scout application.\n\nWe appreciate your patience and will get back to you as soon as possible.\n\nBest,\nThe Cofactor Team`,
    html: `
        <div style="font-family: Arial, sans-serif; color: #1B2A4A; max-width: 600px; margin: 0 auto; background-color: #FAFBFC; padding: 40px 20px;">
            <div style="background-color: #ffffff; border-radius: 4px; padding: 40px; border: 1px solid #E5E7EB;">
                <img src="${getAppUrl()}/cofactor-scout-navbar-logo.png" alt="Cofactor Scout" style="height: 30px; margin-bottom: 30px; display: block;" />
                <h1 style="color: #0D7377; font-size: 28px; margin-bottom: 16px;">Reminder Sent ✓</h1>
                <p style="color: #1B2A4A; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">Hi ${name},</p>
                <p style="color: #1B2A4A; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">We've sent a reminder to our team about your pending scout application.</p>
                <p style="color: #1B2A4A; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">We appreciate your patience and will get back to you as soon as possible.</p>
                <p style="color: #1B2A4A; font-size: 16px; line-height: 1.6;">Best,<br>The Cofactor Team</p>
            </div>
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
                <img src="${getAppUrl()}/cofactor-scout-navbar-logo.png" alt="Cofactor Scout" style="height: 30px; margin-bottom: 30px; display: block;" />
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
                <img src="${getAppUrl()}/cofactor-scout-navbar-logo.png" alt="Cofactor Scout" style="height: 30px; margin-bottom: 30px; display: block;" />
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

interface AccountUpdateData {
    name: string
    changes: string
}

export const accountUpdateTemplate: TemplateFn<AccountUpdateData> = ({ name, changes }) => ({
    subject: 'Account Settings Updated',
    text: `Hi ${name},\n\nYour account settings have been successfully updated.\n\nChanges made: ${changes}\n\nIf you didn't make these changes, please contact support immediately.\n\nBest,\nThe Cofactor Team`,
    html: `
        <div style="font-family: Arial, sans-serif; color: #1B2A4A; max-width: 600px; margin: 0 auto; background-color: #FAFBFC; padding: 40px 20px;">
            <div style="background-color: #ffffff; border-radius: 4px; padding: 40px; border: 1px solid #E5E7EB;">
                <img src="${getAppUrl()}/cofactor-scout-navbar-logo.png" alt="Cofactor Scout" style="height: 30px; margin-bottom: 30px; display: block;" />
                <h1 style="color: #0D7377; font-size: 28px; margin-bottom: 16px;">Account Settings Updated ✓</h1>
                <p style="color: #1B2A4A; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">Hi ${name},</p>
                <p style="color: #1B2A4A; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">Your account settings have been successfully updated.</p>
                <div style="background-color: #FAFBFC; padding: 16px; border-radius: 4px; margin: 24px 0;">
                    <p style="color: #6B7280; font-size: 14px; margin: 0;"><strong>Changes made:</strong> ${changes}</p>
                </div>
                <p style="color: #6B7280; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">If you didn't make these changes, please contact support immediately.</p>
                <p style="color: #1B2A4A; font-size: 16px; line-height: 1.6;">Best,<br>The Cofactor Team</p>
            </div>
        </div>
    `
})

interface ProfileUpdateData {
    name: string
}

export const profileUpdateTemplate: TemplateFn<ProfileUpdateData> = ({ name }) => ({
    subject: 'Profile Updated',
    text: `Hi ${name},\n\nYour profile has been successfully updated.\n\nView your profile: ${getAppUrl()}/settings?tab=profile\n\nBest,\nThe Cofactor Team`,
    html: `
        <div style="font-family: Arial, sans-serif; color: #1B2A4A; max-width: 600px; margin: 0 auto; background-color: #FAFBFC; padding: 40px 20px;">
            <div style="background-color: #ffffff; border-radius: 4px; padding: 40px; border: 1px solid #E5E7EB;">
                <img src="${getAppUrl()}/cofactor-scout-navbar-logo.png" alt="Cofactor Scout" style="height: 30px; margin-bottom: 30px; display: block;" />
                <h1 style="color: #0D7377; font-size: 28px; margin-bottom: 16px;">Profile Updated ✓</h1>
                <p style="color: #1B2A4A; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">Hi ${name},</p>
                <p style="color: #1B2A4A; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">Your profile has been successfully updated.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${getAppUrl()}/settings?tab=profile" style="background-color: #0D7377; color: white; padding: 14px 32px; text-decoration: none; border-radius: 9999px; display: inline-block; font-size: 16px; font-weight: 500;">View Profile</a>
                </div>
                <p style="color: #1B2A4A; font-size: 16px; line-height: 1.6;">Best,<br>The Cofactor Team</p>
            </div>
        </div>
    `
})

interface NewSignInData {
    name: string
    timestamp: string
    location?: string
}

export const newSignInTemplate: TemplateFn<NewSignInData> = ({ name, timestamp, location }) => ({
    subject: 'New Sign-In to Your Account',
    text: `Hi ${name},\n\nWe detected a new sign-in to your Cofactor Scout account.\n\nTime: ${timestamp}${location ? `\nLocation: ${location}` : ''}\n\nIf this was you, no action is needed. If you don't recognize this activity, please secure your account immediately.\n\nBest,\nThe Cofactor Team`,
    html: `
        <div style="font-family: Arial, sans-serif; color: #1B2A4A; max-width: 600px; margin: 0 auto; background-color: #FAFBFC; padding: 40px 20px;">
            <div style="background-color: #ffffff; border-radius: 4px; padding: 40px; border: 1px solid #E5E7EB;">
                <img src="${getAppUrl()}/cofactor-scout-navbar-logo.png" alt="Cofactor Scout" style="height: 30px; margin-bottom: 30px; display: block;" />
                <h1 style="color: #0D7377; font-size: 28px; margin-bottom: 16px;">New Sign-In Detected 🔐</h1>
                <p style="color: #1B2A4A; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">Hi ${name},</p>
                <p style="color: #1B2A4A; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">We detected a new sign-in to your Cofactor Scout account.</p>
                <div style="background-color: #FAFBFC; padding: 16px; border-radius: 4px; margin: 24px 0;">
                    <p style="color: #1B2A4A; font-size: 14px; margin: 0 0 8px 0;"><strong>Time:</strong> ${timestamp}</p>
                    ${location ? `<p style="color: #1B2A4A; font-size: 14px; margin: 0;"><strong>Location:</strong> ${location}</p>` : ''}
                </div>
                <p style="color: #1B2A4A; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">If this was you, no action is needed.</p>
                <p style="color: #EF4444; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">If you don't recognize this activity, please secure your account immediately by changing your password.</p>
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
    scoutApplicationNotification: scoutApplicationNotificationTemplate,
    scoutApplicationReminder: scoutApplicationReminderTemplate,
    reminderConfirmation: reminderConfirmationTemplate,
    scoutApproval: scoutApprovalTemplate,
    accountUpdate: accountUpdateTemplate,
    profileUpdate: profileUpdateTemplate,
    newSignIn: newSignInTemplate
} as const



export type EmailTemplateName = keyof typeof emailTemplates
