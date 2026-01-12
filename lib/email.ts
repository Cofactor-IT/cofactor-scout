import nodemailer from 'nodemailer'

// Logger utility for consistent logging
function log(level: 'info' | 'error', message: string, meta?: Record<string, unknown>) {
    const timestamp = new Date().toISOString()
    const logEntry = { timestamp, level, message, ...meta }

    if (process.env.NODE_ENV === 'production') {
        // In production, you'd send this to a logging service
        // For now, use structured console output
        console[level === 'error' ? 'error' : 'log'](JSON.stringify(logEntry))
    } else {
        console[level === 'error' ? 'error' : 'log'](`[${level.toUpperCase()}] ${message}`, meta || '')
    }
}

// Get app URL from environment or use default
function getAppUrl() {
    return process.env.NEXTAUTH_URL || process.env.APP_URL || 'http://localhost:3000'
}

// Configure SMTP Transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
})

export async function sendWelcomeEmail(toEmail: string, name: string) {
    if (!process.env.SMTP_USER) {
        log('info', 'SMTP not configured, skipping welcome email', { toEmail })
        return
    }

    const mailOptions = {
        from: process.env.SMTP_FROM || '"Cofactor Club" <no-reply@cofactor.world>',
        to: toEmail,
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
    }

    try {
        await transporter.sendMail(mailOptions)
        log('info', 'Welcome email sent successfully', { toEmail })
    } catch (error) {
        log('error', 'Failed to send welcome email', { toEmail, error: error instanceof Error ? error.message : String(error) })
    }
}

export async function sendVerificationEmail(toEmail: string, name: string, token: string) {
    if (!process.env.SMTP_USER) {
        log('info', 'SMTP not configured, skipping verification email', { toEmail })
        return
    }

    const verifyUrl = `${getAppUrl()}/auth/verify?token=${token}`

    const mailOptions = {
        from: process.env.SMTP_FROM || '"Cofactor Club" <no-reply@cofactor.world>',
        to: toEmail,
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

    try {
        await transporter.sendMail(mailOptions)
        log('info', 'Verification email sent successfully', { toEmail })
    } catch (error) {
        log('error', 'Failed to send verification email', { toEmail, error: error instanceof Error ? error.message : String(error) })
    }
}

export async function sendPasswordResetEmail(toEmail: string, resetCode: string) {
    if (!process.env.SMTP_USER) {
        log('info', 'SMTP not configured, skipping password reset email', { toEmail })
        return
    }

    const resetUrl = `${getAppUrl()}/auth/reset-password`

    const mailOptions = {
        from: process.env.SMTP_FROM || '"Cofactor Club" <no-reply@cofactor.world>',
        to: toEmail,
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

    try {
        await transporter.sendMail(mailOptions)
        log('info', 'Password reset email sent successfully', { toEmail })
    } catch (error) {
        log('error', 'Failed to send password reset email', { toEmail, error: error instanceof Error ? error.message : String(error) })
    }
}
