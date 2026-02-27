/**
 * Permissions Module
 * 
 * Role-based access control utilities for authentication and authorization.
 * Provides helpers for checking user roles and requiring specific permissions.
 */
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
 * 
 * @returns Session user or null if not authenticated
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
    const session = await getServerSession(authOptions)
    return session?.user as SessionUser | null
}

/**
 * Require authentication - throws AuthenticationError if not logged in
 * 
 * @returns Authenticated user
 * @throws AuthenticationError if not authenticated
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
 * 
 * @returns Authenticated admin user
 * @throws AuthenticationError if not authenticated
 * @throws AuthorizationError if not admin
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
 * 
 * @returns Authenticated scout or admin user
 * @throws AuthenticationError if not authenticated
 * @throws AuthorizationError if not scout or admin
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
 * 
 * @returns True if user is admin
 */
export async function isAdmin(): Promise<boolean> {
    const user = await getCurrentUser()
    return user?.role === 'ADMIN'
}

/**
 * Check if user is scout or admin (non-throwing)
 * 
 * @returns True if user is scout or admin
 */
export async function isScoutOrAdmin(): Promise<boolean> {
    const user = await getCurrentUser()
    return user?.role === 'ADMIN' || user?.role === 'SCOUT'
}

/**
 * Check if user has any of the specified roles
 * 
 * @param roles - Roles to check
 * @returns True if user has any of the roles
 */
export async function hasAnyRole(...roles: UserRole[]): Promise<boolean> {
    const user = await getCurrentUser()
    return user ? roles.includes(user.role) : false
}

/**
 * Require specific roles
 * 
 * @param roles - Required roles
 * @returns Authenticated user with required role
 * @throws AuthenticationError if not authenticated
 * @throws AuthorizationError if user doesn't have required role
 */
export async function requireRoles(...roles: UserRole[]): Promise<SessionUser> {
    const user = await requireAuth()

    if (!roles.includes(user.role)) {
        throw new AuthorizationError(`Required roles: ${roles.join(', ')}`)
    }

    return user
}
