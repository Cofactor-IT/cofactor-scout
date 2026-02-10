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

export function generateRequestId(): string {
    return randomUUID()
}

export function setRequestId(requestId: string) {
    currentRequestId = requestId
}

export function getRequestId(): string | null {
    return currentRequestId
}

export function clearRequestId() {
    currentRequestId = null
}

function log(entry: LogEntry): void {
    const logOutput = {
        level: entry.level,
        message: entry.message,
        timestamp: entry.timestamp,
        requestId: entry.requestId || currentRequestId || undefined,
        ...(entry.userId && { userId: entry.userId }),
        ...(entry.sessionId && { sessionId: entry.sessionId }),
        ...(entry.context && { context: entry.context }),
        ...(entry.error && {
            error: {
                name: entry.error.name,
                message: entry.error.message,
                stack: entry.error.stack?.substring(0, 500)
            }
        })
    }

    if (process.env.NODE_ENV === 'production') {
        console.log(JSON.stringify(logOutput))
    } else {
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
            ...(entry.context && { ...entry.context }),
            ...(entry.error && { error: entry.error.message })
        })
    }
}

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

export function debug(message: string, context?: Record<string, any>): void {
    if (process.env.LOG_LEVEL !== 'debug' && process.env.NODE_ENV === 'production') {
        return
    }
    log(createLogEntry(LogLevel.DEBUG, message, context))
}

export function info(message: string, context?: Record<string, any>): void {
    log(createLogEntry(LogLevel.INFO, message, context))
}

export function warn(message: string, context?: Record<string, any>): void {
    log(createLogEntry(LogLevel.WARN, message, context))
}

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

export function fatal(message: string, context?: Record<string, any>, err?: Error): void {
    const entry = createLogEntry(LogLevel.FATAL, message, context, err)
    log(entry)

    addBreadcrumb('fatal', message, context)
    captureException(err || new Error(message), { message, ...context })
}

export function logUserLogin(userId: string, email: string, method: string): void {
    info('User logged in', {
        userId,
        email: email.substring(0, 3) + '***',
        method
    })
    setSentryUser(userId, email, method)
}

export function logUserLogout(userId: string): void {
    info('User logged out', { userId })
    clearSentryUser()
}

export function logUserSignup(userId: string, email: string, method: string): void {
    info('User signed up', {
        userId,
        email: email.substring(0, 3) + '***',
        method
    })
}

export function logAdminAction(action: string, adminId: string, targetId?: string): void {
    info(`Admin action: ${action}`, {
        adminId,
        ...(targetId && { targetId })
    })
}

export function logSecurityEvent(event: string, severity: 'low' | 'medium' | 'high', context?: Record<string, any>): void {
    const level = severity === 'high' ? LogLevel.ERROR : LogLevel.WARN
    log(createLogEntry(level, `Security event: ${event}`, context))
}

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
