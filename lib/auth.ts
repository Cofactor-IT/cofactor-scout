'use server'

import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

/**
 * Mock session check - In production, use NextAuth getServerSession
 * For now, we check for an admin cookie or first user being admin
 */
export async function getCurrentUser() {
    // In production, replace with: getServerSession(authOptions)
    // For demo, we get the first user or check for admin cookie
    const cookieStore = await cookies()
    const adminCookie = cookieStore.get('admin_session')

    if (adminCookie) {
        return await prisma.user.findFirst({
            where: { role: 'ADMIN' }
        })
    }

    // Fallback to first user for demo
    return await prisma.user.findFirst()
}

/**
 * Verify the current user has ADMIN role
 * Throws an error if not authorized
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
 * Check if current user is an admin (non-throwing version)
 */
export async function isAdmin(): Promise<boolean> {
    const user = await getCurrentUser()
    return user?.role === 'ADMIN'
}
