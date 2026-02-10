import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { checkRateLimitEdge, RateLimitConfig, getClientIp } from '@/lib/rate-limit-edge'

// Define simple rate limits for edge
const RateLimits = {
    AUTH: { limit: 5, window: 15 * 60 * 1000 },
    API_GLOBAL: { limit: 100, window: 60 * 1000 }
}

export default withAuth(
    async function middleware(req) {
        const token = req.nextauth.token
        const isAdmin = token?.role === "ADMIN"
        const isUrlAdmin = req.nextUrl.pathname.startsWith("/admin")
        const isAuthRoute = req.nextUrl.pathname.startsWith("/auth")
        const isApiRoute = req.nextUrl.pathname.startsWith("/api")

        if (isUrlAdmin && !isAdmin) {
            return NextResponse.rewrite(new URL("/auth/signin?error=AccessDenied", req.url))
        }

        const ip = getClientIp(req)

        // Strict rate limiting for auth routes
        if (isAuthRoute) {
            const result = await checkRateLimitEdge(ip, RateLimits.AUTH)

            if (!result.success) {
                return new NextResponse('Too many requests', {
                    status: 429,
                    headers: {
                        'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString()
                    }
                })
            }
        }

        // Global API rate limiting (except auth which is handled above)
        if (isApiRoute && !isAuthRoute) {
            const result = await checkRateLimitEdge(ip, RateLimits.API_GLOBAL)

            if (!result.success) {
                return new NextResponse('Too many requests', {
                    status: 429,
                    headers: {
                        'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString()
                    }
                })
            }
        }

        const nonce = btoa(crypto.randomUUID())

        const cspHeader = `
            default-src 'self';
            script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
            style-src 'self' 'unsafe-inline' 'nonce-${nonce}';
            img-src 'self' blob: data:;
            font-src 'self';
            object-src 'none';
            base-uri 'self';
            form-action 'self';
            frame-ancestors 'none';
            upgrade-insecure-requests;
        `.replace(/\s{2,}/g, ' ').trim()

        const requestHeaders = new Headers(req.headers)
        requestHeaders.set('x-nonce', nonce)
        requestHeaders.set('Content-Security-Policy', cspHeader)

        const response = NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        })

        // Add security headers
        response.headers.set('X-Frame-Options', 'DENY')
        response.headers.set('X-Content-Type-Options', 'nosniff')
        response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
        response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
        response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
        response.headers.set('Content-Security-Policy', cspHeader)

        return response
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                const path = req.nextUrl.pathname

                // Allow access to home page for everyone
                if (path === '/') {
                    return true
                }

                // For all other matched routes, require authentication
                return !!token
            }
        },
        pages: {
            signIn: '/auth/signin',
            newUser: '/auth/signup'
        }
    }
)

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|uploads|api/auth|api/health|api/universities|auth).*)",
    ]
}
