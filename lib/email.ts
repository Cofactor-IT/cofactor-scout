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
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h1>Welcome to Cofactor Club! 🚀</h1>
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

export async function sendPasswordResetEmail(toEmail: string, _resetToken: string) {
    log('info', 'Password reset requested', { toEmail })
    // TODO: Implement password reset email functionality
}
