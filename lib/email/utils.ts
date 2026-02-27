/**
 * utils.ts
 * 
 * Email service utility functions.
 * Provides configuration helpers and type definitions for email system.
 * 
 * Functions check environment variables to determine email configuration
 * and provide consistent defaults across the application.
 */

/**
 * Gets the application URL for email links.
 * Falls back to localhost in development.
 * 
 * @returns Application base URL
 */
export function getAppUrl(): string {
    return process.env.NEXTAUTH_URL || process.env.APP_URL || 'http://localhost:3000'
}

/**
 * Gets the configured "from" email address.
 * Uses SMTP_FROM env var or default Cofactor address.
 * 
 * @returns From email address with display name
 */
export function getFromAddress(): string {
    return process.env.SMTP_FROM || '"Cofactor Club" <no-reply@cofactor.world>'
}

/**
 * Checks if SMTP email is configured.
 * Returns false if SMTP_USER is not set, preventing email send attempts.
 * 
 * @returns True if email is configured
 */
export function isEmailConfigured(): boolean {
    return !!process.env.SMTP_USER
}

/**
 * Base email options interface.
 * Used by email sending functions and queue system.
 */
export interface EmailOptions {
    to: string
    subject: string
    text: string
    html: string
    from?: string
}

/**
 * Email queue item for future queue integration.
 * Includes retry logic and scheduling fields.
 */
export interface EmailQueueItem extends EmailOptions {
    id: string
    attempts: number
    maxAttempts: number
    createdAt: Date
    scheduledFor?: Date
}
