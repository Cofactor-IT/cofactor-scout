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
    // @ts-ignore - $on is valid but sometimes TS complains depending on Prisma version/config
    prisma.$on('query', (e: any) => {
        if (!e || !e.query) return

        const duration = e.duration || 0
        const query = e.query
        const operation = query.split(' ')[0]?.toUpperCase()

        // Simple regex to extract table name from common SQL patterns
        // This is a rough approximation for analytics
        const tableMatch = query.match(/"(\w+)"/)
        const table = tableMatch?.[1] || 'unknown'

        if (operation) {
            trackDbQuery(operation, table, duration)
        }
    })

    // @ts-ignore
    prisma.$on('error', (e: any) => {
        if (!e) return

        trackEvent('db_error', {
            message: e.message || 'Unknown database error',
            target: e.target || 'unknown'
        })
    })
} catch (error) {
    // Ignore errors setting up listeners
    if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to setup Prisma event listeners:', error)
    }
}
