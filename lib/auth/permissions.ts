'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { AuthenticationError, AuthorizationError } from '@/lib/errors'
import type { User } from 'next-auth'

type UserRole = 'ADMIN' | 'STAFF' | 'STUDENT' | 'PENDING_STAFF'

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
 * Require staff or admin role
 */
export async function requireStaffOrAdmin(): Promise<SessionUser> {
    const user = await requireAuth()

    if (user.role !== 'ADMIN' && user.role !== 'STAFF') {
        throw new AuthorizationError('Staff or admin access required')
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
 * Check if user is staff or admin (non-throwing)
 */
export async function isStaffOrAdmin(): Promise<boolean> {
    const user = await getCurrentUser()
    return user?.role === 'ADMIN' || user?.role === 'STAFF'
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

/**
 * Check university ownership for students
 * Students can only access resources for their own university
 */
export async function checkUniversityAccess(targetUniversityId: string | null): Promise<boolean> {
    const user = await getCurrentUser()

    if (!user) return false
    if (user.role === 'ADMIN' || user.role === 'STAFF') return true

    // Check both primary and secondary universities
    // Note: This requires the user object to have universityId and secondaryUniversityId
    // You may need to extend the SessionUser type based on your needs
    return false // Override this in specific implementations
}

/**
 * Get user with university info for access control
 */
export async function getUserWithUniversities() {
    const { prisma } = await import('@/lib/database/prisma')
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) return null

    return prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            email: true,
            role: true,
            universityId: true,
            secondaryUniversityId: true
        }
    })
}
