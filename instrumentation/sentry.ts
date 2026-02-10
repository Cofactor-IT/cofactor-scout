import * as Sentry from '@sentry/nextjs'

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1.0,
    beforeSend(event, hint) {
        if (event.request) {
            const headers = { ...event.request.headers }
            delete headers['authorization']
            delete headers['cookie']
            event.request.headers = headers
        }
        
        if (event.breadcrumbs) {
            event.breadcrumbs = event.breadcrumbs.filter(bc => {
                return !bc.message?.toLowerCase().includes('password')
            })
        }
        
        return event
    },
    beforeSendTransaction(event) {
        if (event.transaction?.includes('/api/health') ||
            event.transaction?.includes('/_next')) {
            return null
        }
        return event
    }
})

export function setSentryUser(userId: string, email: string, role: string) {
    Sentry.setUser({
        id: userId,
        email,
        role
    })
}

export function clearSentryUser() {
    Sentry.setUser(null)
}

export function addBreadcrumb(category: string, message: string, data?: Record<string, any>) {
    Sentry.addBreadcrumb({
        category,
        message,
        level: 'info',
        data
    })
}

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
