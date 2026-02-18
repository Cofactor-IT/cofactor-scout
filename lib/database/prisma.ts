import { PrismaClient } from '@prisma/client'
import { trackDbQuery, trackEvent } from '@/lib/analytics'

const prismaClientSingleton = () => {
    return new PrismaClient({
        datasources: {
            db: {
                url: process.env.DATABASE_URL
            }
        },
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientSingleton | undefined
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Only attach event listeners if we're in a context where they are supported
// Prisma Client extensions or certain runtime environments might not support $on
try {
    // @ts-expect-error Prisma $on isn't available in some runtimes/types
    prisma.$on('query', (e: unknown) => {
        const event = e as { query?: string; duration?: number } | null
        if (!event?.query) return

        const duration = event.duration || 0
        const query = event.query
        const operation = query.split(' ')[0]?.toUpperCase()

        // Simple regex to extract table name from common SQL patterns
        // This is a rough approximation for analytics
        const tableMatch = query.match(/"(\w+)"/)
        const table = tableMatch?.[1] || 'unknown'

        if (operation) {
            trackDbQuery(operation, table, duration)
        }
    })

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
    // Ignore errors setting up listeners
    if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to setup Prisma event listeners:', error)
    }
}
