/**
 * Analytics Utilities
 * 
 * Wrapper functions for Vercel Analytics tracking.
 * Handles both client and server-side tracking with graceful fallbacks.
 */
import { track as clientTrack } from '@vercel/analytics'

/**
 * Universal track function that works on both client and server
 * 
 * @param name - Event name
 * @param properties - Event properties
 */
async function track(name: string, properties?: Record<string, string | number | boolean>) {
    if (typeof window === 'undefined') {
        // Server-side tracking
        try {
            const { track: serverTrack } = await import('@vercel/analytics/server')
            await serverTrack(name, properties as any)
        } catch (e) {
            // Silently fail if server tracking unavailable
        }
    } else {
        // Client-side tracking
        try {
            clientTrack(name, properties as any)
        } catch (e) {
            // Silently fail if analytics not available
        }
    }
}

/**
 * Track page view
 * 
 * @param path - Page path
 * @param title - Page title
 */
export function trackPageView(path: string, title: string) {
    track('pageview', {
        path,
        title
    })
}

/**
 * Track custom event
 * 
 * @param name - Event name
 * @param properties - Event properties
 */
export function trackEvent(name: string, properties?: Record<string, string | number>) {
    track(name, properties)
}

/**
 * Track user login
 * 
 * @param userId - User ID
 * @param method - Login method (email, oauth, etc.)
 */
export function trackLogin(userId: string, method: string) {
    track('user_login', {
        user_id: userId,
        method,
        success: true
    })
}

/**
 * Track user logout
 * 
 * @param userId - User ID
 */
export function trackLogout(userId: string) {
    track('user_logout', {
        user_id: userId
    })
}

/**
 * Track user signup
 * 
 * @param userId - User ID
 * @param method - Signup method
 */
export function trackSignup(userId: string, method: string) {
    track('user_signup', {
        user_id: userId,
        method
    })
}

/**
 * Track performance metric
 * 
 * @param metricName - Metric name
 * @param value - Metric value
 * @param unit - Unit of measurement
 */
export function trackPerformanceMetric(metricName: string, value: number, unit: string) {
    track(metricName, {
        value,
        unit,
        timestamp: Date.now()
    })
}

/**
 * Track API request
 * 
 * @param endpoint - API endpoint
 * @param method - HTTP method
 * @param duration - Request duration in ms
 * @param status - HTTP status code
 */
export function trackApiRequest(endpoint: string, method: string, duration: number, status: number) {
    track('api_request', {
        endpoint,
        method,
        duration_ms: duration,
        status,
        success: status >= 200 && status < 300
    })
}

/**
 * Track database query
 * 
 * @param operation - Query operation (select, insert, etc.)
 * @param table - Table name
 * @param duration - Query duration in ms
 */
export function trackDbQuery(operation: string, table: string, duration: number) {
    track('db_query', {
        operation,
        table,
        duration_ms: duration
    })
}

/**
 * Track wiki edit (legacy - wiki removed)
 * 
 * @param userId - User ID
 * @param pageId - Page ID
 */
export function trackWikiEdit(userId: string, pageId: string) {
    track('wiki_edit', {
        user_id: userId,
        page_id: pageId
    })
}


