import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

// Require authentication for admin routes
export default withAuth(
    function middleware(req) {
        // Just verify token exists and has Admin role for /admin paths
        const token = req.nextauth.token
        const isAdmin = token?.role === "ADMIN"
        const isUrlAdmin = req.nextUrl.pathname.startsWith("/admin")

        if (isUrlAdmin && !isAdmin) {
            return NextResponse.rewrite(new URL("/auth/signin?error=AccessDenied", req.url))
        }
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token
        },
    }
)

export const config = { matcher: ["/admin/:path*"] }
