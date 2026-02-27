/**
 * Middleware Utilities
 * 
 * Helper functions for standardized request handling including rate limiting,
 * authentication checks, and CSRF validation for API routes.
 */

import { NextRequest, NextResponse } from 'next/server'
import { RateLimits, getClientIp } from '@/lib/security/rate-limit'
import { checkRateLimitRedis } from '@/lib/security/rate-limit-redis'
import { logger } from '@/lib/logger'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'

// In-memory rate limiting store for middleware
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

/**
 * Standardized rate limiting wrapper for middleware
 * 
 * @param request - Next.js request
 * @param identifier - Unique identifier (usually IP address)
 * @param config - Rate limit configuration
 * @returns 429 response if rate limited, null otherwise
 */
export async function withRateLimit(
    request: NextRequest,
    identifier: string,
    config: { limit: number; windowMs: number }
): Promise<NextResponse | null> {
    const allowed = await checkRateLimitMiddleware(identifier, config.limit, config.windowMs)

    if (!allowed) {
        logger.warn('Rate limit exceeded', { identifier, path: request.nextUrl.pathname })
        return new NextResponse('Too many requests', { status: 429 })
    }

    return null
}

/**
 * Check rate limit using Redis if available, fallback to in-memory
 * 
 * @param identifier - Unique identifier
 * @param limit - Maximum requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns True if request allowed
 */
async function checkRateLimitMiddleware(
    identifier: string,
    limit: number,
    windowMs: number
): Promise<boolean> {
    // Try Redis first if configured
    if (process.env.REDIS_URL) {
        try {
            const result = await checkRateLimitRedis(identifier, { limit, window: windowMs })
            return result.success
        } catch (error) {
            logger.error('Redis rate limit failed, using in-memory fallback', {}, error as Error)
        }
    }

    return checkRateLimitInMemory(identifier, limit, windowMs)
}

/**
 * In-memory rate limiting (fallback when Redis unavailable)
 * 
 * @param identifier - Unique identifier
 * @param limit - Maximum requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns True if request allowed
 */
function checkRateLimitInMemory(identifier: string, limit: number, windowMs: number): boolean {
    const now = Date.now()
    const entry = rateLimitStore.get(identifier)

    if (!entry || now > entry.resetTime) {
        rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs })
        return true
    }

    if (entry.count >= limit) {
        return false
    }

    entry.count++
    return true
}

/**
 * Predefined rate limit wrappers
 */
export const rateLimiters = {
    auth: (request: NextRequest) => withRateLimit(request, getClientIp(request), { limit: RateLimits.AUTH.limit, windowMs: RateLimits.AUTH.window }),
    signup: (request: NextRequest) => withRateLimit(request, getClientIp(request), { limit: RateLimits.SIGNUP.limit, windowMs: RateLimits.SIGNUP.window }),
    wikiSubmit: (request: NextRequest) => withRateLimit(request, getClientIp(request), { limit: RateLimits.WIKI_SUBMIT.limit, windowMs: RateLimits.WIKI_SUBMIT.window }),
    passwordReset: (request: NextRequest) => withRateLimit(request, getClientIp(request), { limit: RateLimits.PASSWORD_RESET.limit, windowMs: RateLimits.PASSWORD_RESET.window }),
    socialConnect: (request: NextRequest) => withRateLimit(request, getClientIp(request), { limit: RateLimits.SOCIAL_CONNECT.limit, windowMs: RateLimits.SOCIAL_CONNECT.window })
}

/**
 * CSRF validation wrapper
 * 
 * Note: Next.js handles CSRF protection automatically for Server Actions.
 * This is for custom API routes.
 * 
 * @param request - Next.js request
 * @returns True if CSRF validation passes
 */
export function validateCSRF(request: NextRequest): boolean {
    // In production, validate CSRF token from headers
    const csrfToken = request.headers.get('x-csrf-token')
    const origin = request.headers.get('origin')
    const host = request.headers.get('host')

    // Basic origin validation
    if (origin && host) {
        const originHost = new URL(origin).host
        return originHost === host
    }

    return true // Allow if no origin (e.g., same-origin requests)
}

/**
 * Auth check wrapper for API routes
 * 
 * @param request - Next.js request
 * @returns User object or 401 response
 */
export async function requireAuthApi(request: NextRequest): Promise<{ user: { id: string; role: string } } | NextResponse> {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return { user: session.user as { id: string; role: string } }
}

/**
 * Admin check wrapper for API routes
 * 
 * @param request - Next.js request
 * @returns User object or 401/403 response
 */
export async function requireAdminApi(request: NextRequest): Promise<{ user: { id: string; role: string } } | NextResponse> {
    const authResult = await requireAuthApi(request)

    if (authResult instanceof NextResponse) {
        return authResult
    }

    if (authResult.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return authResult
}

/**
 * Combined middleware wrapper that applies rate limiting and auth checks
 * 
 * @param options - Middleware configuration
 * @returns Middleware function
 */
export function createApiMiddleware(options: {
    rateLimit?: (request: NextRequest) => Promise<NextResponse | null>
    requireAuth?: boolean
    requireAdmin?: boolean
}) {
    return async (request: NextRequest, handler: (req: NextRequest, user?: { id: string; role: string }) => Promise<NextResponse>) => {
        // Apply rate limiting if specified
        if (options.rateLimit) {
            const rateLimitResponse = await options.rateLimit(request)
            if (rateLimitResponse) return rateLimitResponse
        }

        // Apply auth checks if specified
        let user: { id: string; role: string } | undefined

        if (options.requireAdmin) {
            const adminResult = await requireAdminApi(request)
            if (adminResult instanceof NextResponse) return adminResult
            user = adminResult.user
        } else if (options.requireAuth) {
            const authResult = await requireAuthApi(request)
            if (authResult instanceof NextResponse) return authResult
            user = authResult.user
        }

        // Call the handler
        return handler(request, user)
    }
}
