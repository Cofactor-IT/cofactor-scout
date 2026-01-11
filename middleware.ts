import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

/**
 * Rate limiting store for middleware (in-memory)
 * For production, use Redis or a dedicated rate-limiting service
 */
const rateLimit = new Map<string, { count: number; resetTime: number }>()

/**
 * Check rate limit for a given identifier
 */
function checkRateLimit(identifier: string, limit: number, windowMs: number): boolean {
    const now = Date.now()
    const entry = rateLimit.get(identifier)

    if (!entry || now > entry.resetTime) {
        rateLimit.set(identifier, { count: 1, resetTime: now + windowMs })
        return true
    }

    if (entry.count >= limit) {
        return false
    }

    entry.count++
    return true
}

/**
 * Clean up expired rate limit entries periodically
 */
setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimit.entries()) {
        if (now > entry.resetTime) {
            rateLimit.delete(key)
        }
    }
}, 60000) // Every minute

/**
 * Get client IP from various headers (works with proxies, Cloudflare, Vercel)
 */
function getClientIp(request: Request): string {
    const headers = request.headers
    return (
        headers.get('x-forwarded-for')?.split(',')[0].trim() ||
        headers.get('x-real-ip') ||
        headers.get('cf-connecting-ip') ||
        'unknown'
    )
}

// Require authentication for admin routes
export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token
        const isAdmin = token?.role === "ADMIN"
        const isUrlAdmin = req.nextUrl.pathname.startsWith("/admin")
        const isAuthRoute = req.nextUrl.pathname.startsWith("/auth")

        // Admin route protection
        if (isUrlAdmin && !isAdmin) {
            return NextResponse.rewrite(new URL("/auth/signin?error=AccessDenied", req.url))
        }

        // Rate limiting for auth routes (prevents brute force attacks)
        if (isAuthRoute) {
            const ip = getClientIp(req)
            const allowed = checkRateLimit(ip, 10, 60000) // 10 requests per minute per IP

            if (!allowed) {
                return new NextResponse('Too many requests', { status: 429 })
            }
        }

        const response = NextResponse.next()

        // Add security headers
        response.headers.set('X-Frame-Options', 'DENY') // Prevent clickjacking
        response.headers.set('X-Content-Type-Options', 'nosniff') // Prevent MIME sniffing
        response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
        response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')

        // Content Security Policy (basic version)
        // Note: In production, you may need to adjust this based on your needs
        const cspHeader = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // unsafe-inline needed for Next.js development
            "style-src 'self' 'unsafe-inline'", // unsafe-inline needed for styled-jsx and similar
            "img-src 'self' data: https: blob:",
            "font-src 'self' data:",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'none'",
            "upgrade-insecure-requests"
        ].join('; ')

        response.headers.set('Content-Security-Policy', cspHeader)

        // Note: NextAuth handles CSRF protection internally via JWT tokens
        // Server Actions are protected by Next.js's built-in CSRF protection
        // when using the 'use server' directive

        return response
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token
        },
    }
)

export const config = {
    matcher: [
        // Apply to all routes except static files and API routes that handle their own security
        "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
    ]
}
