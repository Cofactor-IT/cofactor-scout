/**
 * Edge-compatible in-memory rate limiter
 * Uses a simple Map with cleanup
 */

interface RateLimitEntry {
    count: number
    resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Cleanup interval (approximate, since Edge runtime might kill timers)
const CLEANUP_INTERVAL = 60 * 1000
let lastCleanup = Date.now()
let cleanupCounter = 0

/**
 * Clean up expired entries
 */
function cleanup() {
    const now = Date.now()
    if (now - lastCleanup < CLEANUP_INTERVAL) return

    for (const [key, entry] of rateLimitStore.entries()) {
        if (now > entry.resetTime) {
            rateLimitStore.delete(key)
        }
    }
    lastCleanup = now
}

export interface RateLimitConfig {
    limit: number
    window: number
}

export interface RateLimitResult {
    success: boolean
    remaining: number
    resetTime: number
}

/**
 * Check rate limit
 */
export async function checkRateLimitEdge(
    identifier: string,
    config: RateLimitConfig
): Promise<RateLimitResult> {
    const now = Date.now()
    const key = `${identifier}:${config.window}`

    // Deterministic cleanup (every 20th request)
    cleanupCounter++
    if (cleanupCounter % 20 === 0) {
        cleanup()
    }

    const entry = rateLimitStore.get(key)

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

    entry.count++

    if (entry.count > config.limit) {
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

    return 'unknown'
}
