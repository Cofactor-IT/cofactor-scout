import { Redis } from 'ioredis'
import { info, error } from '@/lib/logger'

let redis: Redis | null = null

export function getQueueConnection(): Redis | null {
    if (!redis && process.env.REDIS_URL) {
        redis = new Redis(process.env.REDIS_URL, {
            maxRetriesPerRequest: 3,
            enableReadyCheck: true,
        })

        redis.on('connect', () => {
            info('Redis connected for queue system')
        })

        redis.on('error', (err) => {
            error('Redis connection error in queue system', { error: err.message })
        })

        redis.on('close', () => {
            info('Redis connection closed')
        })
    }

    return redis
}

export async function closeQueueConnection(): Promise<void> {
    if (redis) {
        await redis.quit()
        redis = null
        info('Queue Redis connection closed')
    }
}

export async function isQueueConnectionHealthy(): Promise<boolean> {
    try {
        const client = getQueueConnection()
        if (!client) return false
        await client.ping()
        return true
    } catch {
        return false
    }
}

export function getQueueConnectionOptions() {
    return {
        connection: getQueueConnection(),
        prefix: 'bullmq',
        defaultJobOptions: {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 1000,
            },
            removeOnComplete: {
                count: 100,
                age: 24 * 3600,
            },
            removeOnFail: {
                count: 50,
                age: 7 * 24 * 3600,
            },
        },
    }
}
