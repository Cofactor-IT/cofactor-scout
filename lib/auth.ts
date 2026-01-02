'use server'

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"

/**
 * Get current session user
 */
export async function getCurrentUser() {
    const session = await getServerSession(authOptions)
    return session?.user
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
