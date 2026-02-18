import { prisma } from '@/lib/database/prisma'
import { unstable_cache } from 'next/cache'

// Use unstable_cache for performance, revalidating when settings change
export const getSystemSettings = unstable_cache(
    async () => {
        // Try to find existing settings
        let settings = await prisma.systemSettings.findFirst()

        // If not found, create default
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
