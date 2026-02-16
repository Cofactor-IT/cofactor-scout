import { Redis } from 'ioredis'
import { RateLimitConfig, RateLimitResult } from '@/lib/security/rate-limit'

let redis: Redis | null = null

function getRedisClient(): Redis | null {
    if (!redis && typeof process !== 'undefined' && process.env.REDIS_URL) {
        redis = new Redis(process.env.REDIS_URL, {
            maxRetriesPerRequest: 3,
        })
    }
    return redis
}

export async function checkRateLimitRedis(
    identifier: string,
    config: RateLimitConfig
): Promise<RateLimitResult> {
    const client = getRedisClient()
    const now = Date.now()
    const key = `ratelimit:${identifier}:${config.window}`

    if (!client) {
        const { checkRateLimit } = await import('./rate-limit')
        return checkRateLimit(identifier, config)
    }

    try {
        const current = await client.incr(key)
        const isFirstRequest = current === 1

        if (isFirstRequest) {
            await client.expire(key, config.window / 1000)
        }

        const remaining = Math.max(0, config.limit - current)
        const resetTime = now + config.window

        return {
            success: current <= config.limit,
            remaining,
            resetTime
        }
    } catch (error) {
        console.error('Redis rate limit error, falling back to in-memory:', error)
        const { checkRateLimit } = await import('./rate-limit')
        return checkRateLimit(identifier, config)
    }
}

export async function closeRedis(): Promise<void> {
    if (redis) {
        await redis.quit()
        redis = null
    }
}

export async function isRedisHealthy(): Promise<boolean> {
    try {
        const client = getRedisClient()
        if (!client) return false
        await client.ping()
        return true
    } catch {
        return false
    }
}
