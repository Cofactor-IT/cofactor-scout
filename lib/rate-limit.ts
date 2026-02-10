/**
 * In-memory rate limiting for API endpoints and form submissions.
 * For production, consider using Redis or a dedicated rate-limiting service.
 * Use checkRateLimitRedis from './rate-limit-redis' for production deployments.
 */

interface RateLimitEntry {
    count: number
    resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()
let cleanupInterval: NodeJS.Timeout | null = null

/**
 * Clean up expired entries from the rate limit store
 */
function cleanupExpiredEntries() {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore.entries()) {
        if (now > entry.resetTime) {
            rateLimitStore.delete(key)
        }
    }
}

// Run cleanup every minute
if (typeof setInterval !== 'undefined') {
    cleanupInterval = setInterval(cleanupExpiredEntries, 60 * 1000)
}

export function cleanupRateLimitStore() {
    if (cleanupInterval) {
        clearInterval(cleanupInterval)
        cleanupInterval = null
    }
    rateLimitStore.clear()
}

if (typeof process !== 'undefined' && process.on) {
    process.on('exit', cleanupRateLimitStore)
    process.on('SIGINT', cleanupRateLimitStore)
    process.on('SIGTERM', cleanupRateLimitStore)
}

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
    /** Maximum number of requests allowed */
    limit: number
    /** Time window in milliseconds */
    window: number
    /** Custom identifier generator (defaults to IP-based) */
    identifier?: string
}

/**
 * Result of a rate limit check
 */
export interface RateLimitResult {
    success: boolean
    remaining: number
    resetTime: number
}

/**
 * Check if a request should be rate limited
 * @param identifier Unique identifier for the requestor (e.g., IP, email, user ID)
 * @param config Rate limit configuration
 * @returns Rate limit result
 */
export function checkRateLimit(
    identifier: string,
    config: RateLimitConfig
): RateLimitResult {
    const now = Date.now()
    const key = `${identifier}:${config.window}`

    const entry = rateLimitStore.get(key)

    // Create new entry if none exists or window has expired
    if (!entry || now > entry.resetTime) {
        const newEntry: RateLimitEntry = {
            count: 1,
            resetTime: now + config.window
        }
        rateLimitStore.set(key, newEntry)

        return {
            success: true,
            remaining: config.limit - 1,
            resetTime: newEntry.resetTime
        }
    }

    // Increment count for existing entry
    entry.count++

    if (entry.count > config.limit) {
        // Rate limit exceeded
        return {
            success: false,
            remaining: 0,
            resetTime: entry.resetTime
        }
    }

    return {
        success: true,
        remaining: config.limit - entry.count,
        resetTime: entry.resetTime
    }
}

/**
 * Get client IP address from request headers
 * Works with Vercel, Cloudflare, and standard proxies
 */
export function getClientIp(request: Request): string {
    // Check various headers for the real IP
    const headers = request.headers
    const forwardedFor = headers.get('x-forwarded-for')
    const realIp = headers.get('x-real-ip')
    const cfConnectingIp = headers.get('cf-connecting-ip')

    if (forwardedFor) {
        // x-forwarded-for can contain multiple IPs, take the first one
        return forwardedFor.split(',')[0].trim()
    }

    if (realIp) {
        return realIp
    }

    if (cfConnectingIp) {
        return cfConnectingIp
    }

    // Fallback to a default (in production, you should always have one of the above)
    return 'unknown'
}

/**
 * Pre-configured rate limits for different actions
 */
export const RateLimits = {
    /** Strict rate limit for authentication attempts */
    AUTH: { limit: 5, window: 15 * 60 * 1000 } as const, // 5 attempts per 15 minutes

    /** Moderate rate limit for registrations */
    SIGNUP: { limit: 3, window: 60 * 60 * 1000 } as const, // 3 attempts per hour

    /** Lenient rate limit for wiki submissions */
    WIKI_SUBMIT: { limit: 10, window: 60 * 60 * 1000 } as const, // 10 per hour

    /** Rate limit for social connection updates */
    SOCIAL_CONNECT: { limit: 20, window: 60 * 60 * 1000 } as const, // 20 per hour

    /** Very strict rate limit for password reset */
    PASSWORD_RESET: { limit: 3, window: 60 * 60 * 1000 } as const, // 3 per hour
} as const
