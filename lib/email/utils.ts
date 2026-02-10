/**
 * Email service utilities
 */

export function getAppUrl(): string {
    return process.env.NEXTAUTH_URL || process.env.APP_URL || 'http://localhost:3000'
}

export function getFromAddress(): string {
    return process.env.SMTP_FROM || '"Cofactor Club" <no-reply@cofactor.world>'
}

export function isEmailConfigured(): boolean {
    return !!process.env.SMTP_USER
}

/**
 * Base email options interface
 * Allows for queue integration in the future
 */
export interface EmailOptions {
    to: string
    subject: string
    text: string
    html: string
    from?: string
}

/**
 * Email queue item for future queue integration
 */
export interface EmailQueueItem extends EmailOptions {
    id: string
    attempts: number
    maxAttempts: number
    createdAt: Date
    scheduledFor?: Date
}
