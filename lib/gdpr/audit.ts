/**
 * GDPR Audit Logging
 * Specialized logging for data protection compliance
 */

import { logger } from '@/lib/logger'

export type GdprAction = 
    | 'export_requested'
    | 'export_downloaded'
    | 'deletion_requested'
    | 'deletion_confirmed'
    | 'deletion_completed'
    | 'data_accessed'
    | 'anonymization_completed'

interface GdprAuditLog {
    action: GdprAction
    userId: string
    timestamp: Date
    ipAddress?: string
    userAgent?: string
    details?: Record<string, unknown>
    success: boolean
    errorMessage?: string
}

export function logGdprAction(
    action: GdprAction,
    userId: string,
    success: boolean,
    details?: Record<string, unknown>,
    errorMessage?: string
): void {
    const logEntry: GdprAuditLog = {
        action,
        userId,
        timestamp: new Date(),
        details,
        success,
        errorMessage
    }

    // Log to main logger with GDPR prefix
    logger.info(`[GDPR] ${action}`, {
        userId,
        action,
        success,
        ...details,
        ...(errorMessage && { error: errorMessage })
    })

    // In production, you might want to send this to a dedicated audit log system
    // or a separate database table for long-term retention
    if (process.env.NODE_ENV === 'production') {
        // Example: Send to dedicated audit service
        // await sendToAuditService(logEntry)
    }
}

export function logExportRequest(userId: string, format: string, success: boolean): void {
    logGdprAction('export_requested', userId, success, { format })
}

export function logExportDownload(userId: string, exportId: string, success: boolean): void {
    logGdprAction('export_downloaded', userId, success, { exportId })
}

export function logDeletionRequest(userId: string, mode: 'soft' | 'hard', success: boolean): void {
    logGdprAction('deletion_requested', userId, success, { mode })
}

export function logDeletionConfirmation(userId: string, token: string, success: boolean): void {
    logGdprAction('deletion_confirmed', userId, success, { 
        tokenHash: token.substring(0, 8) + '...' // Only log partial token for security
    })
}

export function logDeletionCompleted(
    userId: string, 
    mode: 'soft' | 'hard', 
    success: boolean,
    details?: Record<string, unknown>
): void {
    logGdprAction(
        mode === 'soft' ? 'anonymization_completed' : 'deletion_completed',
        userId,
        success,
        details
    )
}

export function logDataAccess(
    userId: string, 
    dataCategory: string, 
    accessedBy: string,
    success: boolean
): void {
    logGdprAction('data_accessed', userId, success, { 
        dataCategory,
        accessedBy: accessedBy === userId ? 'self' : accessedBy
    })
}
