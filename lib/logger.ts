/**
 * Logger Module
 * 
 * Structured logging with Sentry integration, PII masking, and request tracking.
 * Provides debug, info, warn, error, and fatal log levels.
 */
import { randomUUID } from 'crypto'
import * as Sentry from '@sentry/nextjs'
import { setSentryUser, clearSentryUser, addBreadcrumb, captureException } from '@/instrumentation/sentry'

export enum LogLevel {
    DEBUG = 'debug',
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error',
    FATAL = 'fatal'
}

interface LogEntry {
    level: LogLevel
    message: string
    timestamp: string
    requestId?: string
    userId?: string
    sessionId?: string
    context?: Record<string, any>
    error?: Error
}

let currentRequestId: string | null = null

/**
 * Generate unique request ID
 * 
 * @returns UUID string
 */
export function generateRequestId(): string {
    return randomUUID()
}

/**
 * Set request ID for current context
 * 
 * @param requestId - Request ID to set
 */
export function setRequestId(requestId: string) {
    currentRequestId = requestId
}

/**
 * Get current request ID
 * 
 * @returns Current request ID or null
 */
export function getRequestId(): string | null {
    return currentRequestId
}

/**
 * Clear current request ID
 */
export function clearRequestId() {
    currentRequestId = null
}

/**
 * Partially masks an email address for privacy
 * 
 * @param email - Email to mask
 * @returns Masked email (e.g., "joh***@example.com")
 */
export function maskEmail(email: string): string {
    if (!email || typeof email !== 'string' || !email.includes('@')) {
        return email
    }
    const [local, domain] = email.split('@')
    const maskedLocal = local.length > 3
        ? local.substring(0, 3) + '***'
        : local.charAt(0) + '***'
    return `${maskedLocal}@${domain}`
}

/**
 * Recursively masks sensitive fields in an object
 * 
 * @param obj - Object to mask
 * @returns Object with masked sensitive fields
 */
export function maskSensitiveData(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
        return obj
    }

    if (Array.isArray(obj)) {
        return obj.map(maskSensitiveData)
    }

    const masked: Record<string, any> = {}
    for (const [key, value] of Object.entries(obj)) {
        const lowerKey = key.toLowerCase()
        // Mask email fields
        if (typeof value === 'string' && (
            lowerKey.includes('email') ||
            lowerKey === 'to' ||
            lowerKey === 'useremail' ||
            lowerKey === 'toemail'
        )) {
            masked[key] = maskEmail(value)
        } else if (typeof value === 'object') {
            masked[key] = maskSensitiveData(value)
        } else {
            masked[key] = value
        }
    }
    return masked
}

/**
 * Internal log function that formats and outputs log entries
 * 
 * @param entry - Log entry to output
 */
function log(entry: LogEntry): void {
    const maskedContext = entry.context ? maskSensitiveData(entry.context) : undefined

    const logOutput = {
        level: entry.level,
        message: entry.message,
        timestamp: entry.timestamp,
        requestId: entry.requestId || currentRequestId || undefined,
        ...(entry.userId && { userId: entry.userId }),
        ...(entry.sessionId && { sessionId: entry.sessionId }),
        ...(maskedContext && { context: maskedContext }),
        ...(entry.error && {
            error: {
                name: entry.error.name,
                message: entry.error.message,
                stack: entry.error.stack?.substring(0, 500)
            }
        })
    }

    if (process.env.NODE_ENV === 'production') {
        // JSON format for production log aggregation
        console.log(JSON.stringify(logOutput))
    } else {
        // Human-readable format for development
        const emoji = {
            [LogLevel.DEBUG]: '🔍',
            [LogLevel.INFO]: 'ℹ️',
            [LogLevel.WARN]: '⚠️',
            [LogLevel.ERROR]: '❌',
            [LogLevel.FATAL]: '💀'
        }[entry.level]

        console.log(`${emoji} [${entry.level.toUpperCase()}] ${entry.message}`, {
            requestId: entry.requestId || currentRequestId,
            ...(entry.userId && { userId: entry.userId }),
            ...(maskedContext && { ...maskedContext }),
            ...(entry.error && { error: entry.error.message })
        })
    }
}

/**
 * Create log entry object
 * 
 * @param level - Log level
 * @param message - Log message
 * @param context - Additional context
 * @param error - Error object
 * @returns Formatted log entry
 */
function createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error
): LogEntry {
    return {
        level,
        message,
        timestamp: new Date().toISOString(),
        requestId: currentRequestId || undefined,
        context,
        error
    }
}

/**
 * Log debug message (only in development or when LOG_LEVEL=debug)
 * 
 * @param message - Debug message
 * @param context - Additional context
 */
export function debug(message: string, context?: Record<string, any>): void {
    if (process.env.LOG_LEVEL !== 'debug' && process.env.NODE_ENV === 'production') {
        return
    }
    log(createLogEntry(LogLevel.DEBUG, message, context))
}

/**
 * Log info message
 * 
 * @param message - Info message
 * @param context - Additional context
 */
export function info(message: string, context?: Record<string, any>): void {
    log(createLogEntry(LogLevel.INFO, message, context))
}

/**
 * Log warning message
 * 
 * @param message - Warning message
 * @param context - Additional context
 */
export function warn(message: string, context?: Record<string, any>): void {
    log(createLogEntry(LogLevel.WARN, message, context))
}

/**
 * Log error message and send to Sentry
 * 
 * @param message - Error message
 * @param context - Additional context
 * @param err - Error object
 */
export function error(message: string, context?: Record<string, any>, err?: Error): void {
    // Auto-detect error in context if not explicitly passed
    const errorObj = err || (context?.error instanceof Error ? context.error : undefined)
    const entry = createLogEntry(LogLevel.ERROR, message, context, errorObj)
    log(entry)

    addBreadcrumb('error', message, context)

    if (errorObj) {
        captureException(errorObj, { message, ...context })
    } else {
        Sentry.captureMessage(message, { level: 'error', extra: context })
    }
}

/**
 * Log fatal error and send to Sentry
 * 
 * @param message - Fatal error message
 * @param context - Additional context
 * @param err - Error object
 */
export function fatal(message: string, context?: Record<string, any>, err?: Error): void {
    const entry = createLogEntry(LogLevel.FATAL, message, context, err)
    log(entry)

    addBreadcrumb('fatal', message, context)
    captureException(err || new Error(message), { message, ...context })
}

/**
 * Log user login event
 * 
 * @param userId - User ID
 * @param email - User email
 * @param method - Login method
 */
export function logUserLogin(userId: string, email: string, method: string): void {
    info('User logged in', {
        userId,
        email: maskEmail(email),
        method
    })
    if (typeof window !== 'undefined' && document.cookie.includes('"error":true')) {
        setSentryUser(userId, email, method)
    }
}

/**
 * Log user logout event
 * 
 * @param userId - User ID
 */
export function logUserLogout(userId: string): void {
    info('User logged out', { userId })
    if (typeof window !== 'undefined') {
        clearSentryUser()
    }
}

/**
 * Log user signup event
 * 
 * @param userId - User ID
 * @param email - User email
 * @param method - Signup method
 */
export function logUserSignup(userId: string, email: string, method: string): void {
    info('User signed up', {
        userId,
        email: maskEmail(email),
        method
    })
}

/**
 * Log admin action
 * 
 * @param action - Action performed
 * @param adminId - Admin user ID
 * @param targetId - Target resource ID
 */
export function logAdminAction(action: string, adminId: string, targetId?: string): void {
    info(`Admin action: ${action}`, {
        adminId,
        ...(targetId && { targetId })
    })
}

/**
 * Log security event
 * 
 * @param event - Security event description
 * @param severity - Event severity
 * @param context - Additional context
 */
export function logSecurityEvent(event: string, severity: 'low' | 'medium' | 'high', context?: Record<string, any>): void {
    const level = severity === 'high' ? LogLevel.ERROR : LogLevel.WARN
    log(createLogEntry(level, `Security event: ${event}`, context))
}

/**
 * Log API error
 * 
 * @param endpoint - API endpoint
 * @param method - HTTP method
 * @param status - HTTP status code
 * @param err - Error object
 */
export function logApiError(endpoint: string, method: string, status: number, err: Error): void {
    error(`API error: ${method} ${endpoint}`, {
        endpoint,
        status,
        errorCode: err.name,
        errorMessage: err.message
    }, err)
}

export const logger = {
    debug,
    info,
    warn,
    error,
    fatal,
    security: (message: string, context?: Record<string, unknown>) => {
        log(createLogEntry(LogLevel.WARN, `[SECURITY] ${message}`, context))
    }
}

declare global {
    var __requestId__: string | undefined
}
