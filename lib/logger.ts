/**
 * Centralized logging utility for the application
 * In production, this should be replaced with a proper logging service
 * like Sentry, LogRocket, DataDog, or CloudWatch
 */

export enum LogLevel {
    DEBUG = 'debug',
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error'
}

interface LogEntry {
    timestamp: string
    level: LogLevel
    message: string
    context?: Record<string, unknown>
    userId?: string
    requestId?: string
}

/**
 * Generate a unique request ID for tracing
 */
export function generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}



/**
 * Core logging function
 */
function log(level: LogLevel, message: string, context?: Record<string, unknown>) {
    const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        context,
        requestId: globalThis.__requestId__
    }

    // In production with a logging service, send the entry there
    // For now, use structured console output
    const logString = JSON.stringify(entry)

    switch (level) {
        case LogLevel.ERROR:
            console.error(logString)
            break
        case LogLevel.WARN:
            console.warn(logString)
            break
        case LogLevel.INFO:
            console.log(logString)
            break
        case LogLevel.DEBUG:
            if (process.env.NODE_ENV === 'development') {
                console.debug(logString)
            }
            break
    }
}

/**
 * Logger object with convenience methods
 */
export const logger = {
    debug: (message: string, context?: Record<string, unknown>) => {
        log(LogLevel.DEBUG, message, context)
    },

    info: (message: string, context?: Record<string, unknown>) => {
        log(LogLevel.INFO, message, context)
    },

    warn: (message: string, context?: Record<string, unknown>) => {
        log(LogLevel.WARN, message, context)
    },

    error: (message: string, context?: Record<string, unknown>) => {
        log(LogLevel.ERROR, message, context)
    },

    /**
     * Log a security event (always logged regardless of environment)
     */
    security: (message: string, context?: Record<string, unknown>) => {
        log(LogLevel.WARN, `[SECURITY] ${message}`, context)
    }
}

/**
 * Set the current request ID for tracing
 * Call this at the beginning of request handling
 */
export function setRequestId(id: string) {
    globalThis.__requestId__ = id
}

/**
 * Clear the current request ID
 * Call this at the end of request handling
 */
export function clearRequestId() {
    delete globalThis.__requestId__
}

/**
 * Decorator for async handlers to add request tracing and error logging
 */
export function withLogging<T extends (...args: unknown[]) => Promise<unknown>>(
    handler: T,
    context: { name: string }
): T {
    return (async (...args: unknown[]) => {
        const requestId = generateRequestId()
        setRequestId(requestId)

        logger.info(`${context.name} started`, { requestId })

        try {
            const result = await handler(...args)
            logger.info(`${context.name} completed`, { requestId })
            return result
        } catch (error) {
            logger.error(`${context.name} failed`, {
                requestId,
                error: error instanceof Error ? error.message : String(error)
            })
            throw error
        } finally {
            clearRequestId()
        }
    }) as T
}

// Extend globalThis to include our request ID
declare global {
    var __requestId__: string | undefined
}

export { }
