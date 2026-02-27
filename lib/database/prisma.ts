/**
 * prisma.ts
 * 
 * Prisma Client singleton instance with analytics tracking.
 * 
 * Features:
 * - Singleton pattern to prevent multiple instances
 * - Query logging in development
 * - Query performance tracking
 * - Error event tracking
 * - Hot reload support in development
 * 
 * The client is reused across hot reloads in development to prevent
 * "too many clients" errors.
 */

import { PrismaClient } from '@prisma/client'
import { trackDbQuery, trackEvent } from '@/lib/analytics'

/**
 * Creates a new Prisma Client instance with configuration.
 * Enables query logging in development for debugging.
 */
const prismaClientSingleton = () => {
    return new PrismaClient({
        datasources: {
            db: {
                url: process.env.DATABASE_URL
            }
        },
        // Log queries in development, only errors in production
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

// Global singleton to prevent multiple Prisma Client instances
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientSingleton | undefined
}

// Export singleton instance, reusing existing instance if available
export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

// Store instance globally in development to survive hot reloads
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Attach analytics event listeners for query tracking
// Only works in runtimes that support Prisma $on method
try {
    // Track query performance for analytics
    // @ts-expect-error Prisma $on isn't available in some runtimes/types
    prisma.$on('query', (e: unknown) => {
        const event = e as { query?: string; duration?: number } | null
        if (!event?.query) return

        const duration = event.duration || 0
        const query = event.query
        // Extract operation type (SELECT, INSERT, UPDATE, DELETE)
        const operation = query.split(' ')[0]?.toUpperCase()

        // Extract table name from query for categorization
        const tableMatch = query.match(/"(\w+)"/)
        const table = tableMatch?.[1] || 'unknown'

        if (operation) {
            trackDbQuery(operation, table, duration)
        }
    })

    // Track database errors for monitoring
    // @ts-expect-error Prisma $on isn't available in some runtimes/types
    prisma.$on('error', (e: unknown) => {
        const event = e as { message?: string; target?: string } | null
        if (!event) return

        trackEvent('db_error', {
            message: event.message || 'Unknown database error',
            target: event.target || 'unknown'
        })
    })
} catch (error) {
    // Silently ignore if event listeners aren't supported
    if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to setup Prisma event listeners:', error)
    }
}
