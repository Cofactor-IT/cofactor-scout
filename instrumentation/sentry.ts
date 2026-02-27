/**
 * Sentry Configuration
 * 
 * Initializes Sentry error monitoring with privacy-focused settings.
 * Filters sensitive data from error reports.
 */
import * as Sentry from '@sentry/nextjs'

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1.0,
    // Remove sensitive headers before sending to Sentry
    beforeSend(event, hint) {
        if (event.request) {
            const headers = { ...event.request.headers }
            delete headers['authorization']
            delete headers['cookie']
            event.request.headers = headers
        }
        
        // Filter breadcrumbs containing passwords
        if (event.breadcrumbs) {
            event.breadcrumbs = event.breadcrumbs.filter(bc => {
                return !bc.message?.toLowerCase().includes('password')
            })
        }
        
        return event
    },
    // Filter out health checks and Next.js internal transactions
    beforeSendTransaction(event) {
        if (event.transaction?.includes('/api/health') ||
            event.transaction?.includes('/_next')) {
            return null
        }
        return event
    }
})

/**
 * Set user context in Sentry
 * 
 * @param userId - User ID
 * @param email - User email
 * @param role - User role
 */
export function setSentryUser(userId: string, email: string, role: string) {
    Sentry.setUser({
        id: userId,
        email,
        role
    })
}

/**
 * Clear user context from Sentry
 */
export function clearSentryUser() {
    Sentry.setUser(null)
}

/**
 * Add breadcrumb to Sentry for debugging
 * 
 * @param category - Breadcrumb category
 * @param message - Breadcrumb message
 * @param data - Additional data
 */
export function addBreadcrumb(category: string, message: string, data?: Record<string, any>) {
    Sentry.addBreadcrumb({
        category,
        message,
        level: 'info',
        data
    })
}

/**
 * Capture exception with additional context
 * 
 * @param error - Error to capture
 * @param context - Additional context data
 */
export function captureException(error: Error, context?: Record<string, any>) {
    Sentry.withScope((scope) => {
        if (context) {
            Object.entries(context).forEach(([key, value]) => {
                scope.setContext(key, value)
            })
        }
        Sentry.captureException(error)
    })
}
