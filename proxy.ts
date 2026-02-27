/**
 * Next.js Middleware (Proxy)
 * 
 * Handles authentication, authorization, and security headers.
 * Includes disabled rate limiting code for future use.
 */
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
// import { checkRateLimitEdge, getClientIp } from '@/lib/security/rate-limit-edge'

// RATE LIMITING - DISABLED FOR NOW
// Define simple rate limits for edge
// const RateLimits = {
//     AUTH: { limit: 5, window: 15 * 60 * 1000 },
//     API_GLOBAL: { limit: 100, window: 60 * 1000 }
// }

export default withAuth(
    async function middleware(req) {
        const token = req.nextauth.token
        const isAdmin = token?.role === "ADMIN"
        const isUrlAdmin = req.nextUrl.pathname.startsWith("/admin")
        const isAuthRoute = req.nextUrl.pathname.startsWith("/auth")
        const isApiRoute = req.nextUrl.pathname.startsWith("/api")

        // Restrict admin routes to admin users only
        if (isUrlAdmin && !isAdmin) {
            return NextResponse.rewrite(new URL("/auth/signin?error=AccessDenied", req.url))
        }

        // Redirect authenticated users away from auth pages
        if (token && isAuthRoute) {
            const callbackUrl = req.nextUrl.searchParams.get('callbackUrl')
            return NextResponse.redirect(
                new URL(callbackUrl || '/dashboard', req.url)
            )
        }

        // Redirect authenticated users from landing page to dashboard
        if (token && req.nextUrl.pathname === '/') {
            return NextResponse.redirect(new URL('/dashboard', req.url))
        }

        // RATE LIMITING - DISABLED FOR NOW
        // const ip = getClientIp(req)

        // // Global Throughput Limit (DoS protection / Load Shedding)
        // // Limit to 200 requests per second globally across the entire instance
        // const globalResult = await checkRateLimitEdge('global_throughput', { limit: 200, window: 1000 })

        // if (!globalResult.success) {
        //     return new NextResponse('System Busy - Too Many Requests', {
        //         status: 429,
        //         headers: {
        //             'Retry-After': '1',
        //             'X-RateLimit-Limit': '200',
        //             'X-RateLimit-Remaining': '0',
        //             'X-RateLimit-Reset': Math.ceil(globalResult.resetTime / 1000).toString()
        //         }
        //     })
        // }

        // // Strict rate limiting for auth routes
        // if (isAuthRoute) {
        //     const result = await checkRateLimitEdge(ip, RateLimits.AUTH)

        //     if (!result.success) {
        //         return new NextResponse('Too many requests', {
        //             status: 429,
        //             headers: {
        //                 'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString()
        //             }
        //         })
        //     }
        // }

        // // Global API rate limiting (except auth which is handled above)
        // if (isApiRoute && !isAuthRoute) {
        //     const result = await checkRateLimitEdge(ip, RateLimits.API_GLOBAL)

        //     if (!result.success) {
        //         return new NextResponse('Too many requests', {
        //             status: 429,
        //             headers: {
        //                 'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString()
        //             }
        //         })
        //     }
        // }

        // Content Security Policy header
        const cspHeader = `
            default-src 'self';
            script-src 'self' 'unsafe-inline';
            style-src 'self' 'unsafe-inline';
            img-src 'self' blob: data:;
            font-src 'self';
            object-src 'none';
            base-uri 'self';
            form-action 'self';
            frame-ancestors 'none';
            upgrade-insecure-requests;
        `.replace(/\s{2,}/g, ' ').trim()

        const requestHeaders = new Headers(req.headers)
        requestHeaders.set('Content-Security-Policy', cspHeader)

        const response = NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        })

        // Add security headers to response
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
            // Determine if user is authorized to access route
            authorized: ({ token, req }) => {
                const path = req.nextUrl.pathname

                // Allow access to home page, auth pages, scout application, consent API, and submitted page for everyone
                if (path === '/' || path.startsWith('/auth') || path.startsWith('/scout/apply') || path === '/api/consent') {
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
        "/((?!_next/static|_next/image|favicon.ico|public|api/auth|api/health|api/consent).*)",
    ]
}
