'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { AuthenticationError, AuthorizationError } from '@/lib/errors'
import type { User } from 'next-auth'

type UserRole = 'ADMIN' | 'SCOUT' | 'CONTRIBUTOR'

interface SessionUser extends User {
    role: UserRole
    id: string
}

/**
 * Get current session user with full type safety
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
    const session = await getServerSession(authOptions)
    return session?.user as SessionUser | null
}

/**
 * Require authentication - throws AuthenticationError if not logged in
 */
export async function requireAuth(): Promise<SessionUser> {
    const user = await getCurrentUser()

    if (!user) {
        throw new AuthenticationError()
    }

    return user
}

/**
 * Require admin role - throws if not admin
 */
export async function requireAdmin(): Promise<SessionUser> {
    const user = await requireAuth()

    if (user.role !== 'ADMIN') {
        throw new AuthorizationError('Admin access required')
    }

    return user
}

/**
 * Require scout or admin role
 */
export async function requireScoutOrAdmin(): Promise<SessionUser> {
    const user = await requireAuth()

    if (user.role !== 'ADMIN' && user.role !== 'SCOUT') {
        throw new AuthorizationError('Scout or admin access required')
    }

    return user
}

/**
 * Check if user is an admin (non-throwing)
 */
export async function isAdmin(): Promise<boolean> {
    const user = await getCurrentUser()
    return user?.role === 'ADMIN'
}

/**
 * Check if user is scout or admin (non-throwing)
 */
export async function isScoutOrAdmin(): Promise<boolean> {
    const user = await getCurrentUser()
    return user?.role === 'ADMIN' || user?.role === 'SCOUT'
}

/**
 * Check if user has any of the specified roles
 */
export async function hasAnyRole(...roles: UserRole[]): Promise<boolean> {
    const user = await getCurrentUser()
    return user ? roles.includes(user.role) : false
}

/**
 * Require specific roles
 */
export async function requireRoles(...roles: UserRole[]): Promise<SessionUser> {
    const user = await requireAuth()

    if (!roles.includes(user.role)) {
        throw new AuthorizationError(`Required roles: ${roles.join(', ')}`)
    }

    return user
}
