/**
 * System Settings
 * 
 * Cached retrieval of system-wide settings with automatic defaults.
 * Uses Next.js unstable_cache for performance.
 */
import { prisma } from '@/lib/database/prisma'
import { unstable_cache } from 'next/cache'

/**
 * Get system settings with caching
 * 
 * @returns System settings object
 */
export const getSystemSettings = unstable_cache(
    async () => {
        // Try to find existing settings
        let settings = await prisma.systemSettings.findFirst()

        // Create default settings if none exist
        if (!settings) {
            settings = await prisma.systemSettings.create({
                data: {
                    enableEmailNotifications: true,
                    enableInAppNotifications: true
                }
            })
        }

        return settings
    },
    ['system-settings'],
    { tags: ['system-settings'] }
)
