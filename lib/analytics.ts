import { track as clientTrack } from '@vercel/analytics'

export async function hasAnalyticsConsent(): Promise<boolean> {
    if (typeof window === 'undefined') {
        try {
            const { cookies } = await import('next/headers')
            const cookieStore = await cookies()
            const consentCookie = cookieStore.get('cf_consent')?.value
            if (!consentCookie) return false
            const consent = JSON.parse(decodeURIComponent(consentCookie))
            return !!consent.analytics
        } catch (e) {
            // Cannot read cookies in this context (e.g. Prisma query logging out of request lifecycle)
            return false
        }
    } else {
        try {
            return document.cookie.includes('"analytics":true')
        } catch (e) {
            return false
        }
    }
}

async function track(name: string, properties?: Record<string, string | number | boolean>) {
    const isConsentGiven = await hasAnalyticsConsent()
    if (!isConsentGiven) return // Silently abort if no consent

    if (typeof window === 'undefined') {
        try {
            const { track: serverTrack } = await import('@vercel/analytics/server')
            // Server track might behave differently or require request context, 
            // but for now we try to use it or swallow error to prevent crash
            await serverTrack(name, properties as any)
        } catch (e) {
            // console.warn('Failed to track event on server:', e)
        }
    } else {
        // Only track on client if Vercel Analytics is initialized
        // prevents errors in development or when disabled
        try {
            clientTrack(name, properties as any)
        } catch (e) {
            // Silently fail if analytics not available
        }
    }
}

export function trackPageView(path: string, title: string) {
    track('pageview', {
        path,
        title
    })
}

export function trackEvent(name: string, properties?: Record<string, string | number>) {
    track(name, properties)
}

export function trackLogin(userId: string, method: string) {
    track('user_login', {
        user_id: userId,
        method,
        success: true
    })
}

export function trackLogout(userId: string) {
    track('user_logout', {
        user_id: userId
    })
}

export function trackSignup(userId: string, method: string) {
    track('user_signup', {
        user_id: userId,
        method
    })
}

export function trackPerformanceMetric(metricName: string, value: number, unit: string) {
    track(metricName, {
        value,
        unit,
        timestamp: Date.now()
    })
}

export function trackApiRequest(endpoint: string, method: string, duration: number, status: number) {
    track('api_request', {
        endpoint,
        method,
        duration_ms: duration,
        status,
        success: status >= 200 && status < 300
    })
}

export function trackDbQuery(operation: string, table: string, duration: number) {
    track('db_query', {
        operation,
        table,
        duration_ms: duration
    })
}

export function trackWikiEdit(userId: string, pageId: string) {
    track('wiki_edit', {
        user_id: userId,
        page_id: pageId
    })
}


