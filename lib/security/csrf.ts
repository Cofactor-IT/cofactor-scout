/**
 * CSRF Protection
 * 
 * Cross-Site Request Forgery protection using token validation.
 * Validates CSRF tokens from request headers against cookie values using timing-safe comparison.
 */
import { NextRequest } from 'next/server'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const crypto = require('crypto')

/**
 * Compare two tokens using timing-safe comparison to prevent timing attacks
 * 
 * @param a - First token
 * @param b - Second token
 * @returns True if tokens match
 */
function compareTokens(a: string, b: string): boolean {
    if (a.length !== b.length) {
        return false
    }
    const aBuf = Buffer.from(a)
    const bBuf = Buffer.from(b)
    return crypto.timingSafeEqual(aBuf, bBuf)
}

/**
 * Validates CSRF token from request header against cookie value
 * 
 * @param request - Next.js request object
 * @returns True if CSRF token is valid
 */
export async function validateCsrfToken(request: NextRequest): Promise<boolean> {
    const csrfToken = request.headers.get('x-csrf-token')
    
    if (!csrfToken) {
        return false
    }
    
    const tokenPattern = /^[a-f0-9]{32,}$/
    
    if (!tokenPattern.test(csrfToken)) {
        return false
    }
    
    const cookieToken = request.cookies.get('csrf-token')?.value
    
    if (!cookieToken) {
        return false
    }
    
    return compareTokens(csrfToken, cookieToken)
}
