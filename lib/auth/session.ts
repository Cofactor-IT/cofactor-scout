/**
 * session.ts
 * 
 * Server-side session management utilities.
 * Provides authentication checks and role verification.
 * 
 * All functions are server actions that read from NextAuth session.
 * Use these to protect server components and API routes.
 */

'use server'

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"

/**
 * Gets the current authenticated user from session.
 * Returns undefined if not authenticated.
 * 
 * @returns User object or undefined
 */
export async function getCurrentUser() {
    const session = await getServerSession(authOptions)
    return session?.user
}

/**
 * Requires authentication, redirects to signin if not authenticated.
 * Use this in server components that require a logged-in user.
 * 
 * @returns Authenticated user object
 * @throws Redirects to /auth/signin if not authenticated
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    const { redirect } = await import('next/navigation')
    redirect('/auth/signin')
  }
  return session!.user
}

/**
 * Requires ADMIN role, throws error if not authorized.
 * Use this in admin-only server components and API routes.
 * 
 * @returns Admin user object
 * @throws Error if not authenticated or not admin
 */
export async function requireAdmin() {
    const user = await getCurrentUser()

    if (!user) {
        throw new Error('Unauthorized: Not authenticated')
    }

    if (user.role !== 'ADMIN') {
        throw new Error('Forbidden: Admin access required')
    }

    return user
}

/**
 * Checks if current user is an admin without throwing.
 * Use this for conditional rendering based on admin status.
 * 
 * @returns True if user is admin, false otherwise
 */
export async function isAdmin(): Promise<boolean> {
    const user = await getCurrentUser()
    return user?.role === 'ADMIN'
}
