/**
 * Cache Utilities
 * 
 * Redis-based caching layer with fallback when Redis unavailable.
 * Provides get/set/delete operations with TTL support.
 */
import { Redis } from 'ioredis'

let redis: Redis | null = null

/**
 * Get or initialize Redis client
 * 
 * @returns Redis client or null if unavailable
 */
function getRedisClient(): Redis | null {
    if (!redis && typeof process !== 'undefined' && process.env.REDIS_URL) {
        try {
            redis = new Redis(process.env.REDIS_URL, {
                maxRetriesPerRequest: 3,
                connectTimeout: 5000,
                retryStrategy: (times) => {
                    // Exponential backoff with max 2s delay
                    const delay = Math.min(times * 50, 2000)
                    return delay
                }
            })

            // Prevent app crashes on Redis errors
            redis.on('error', (err) => {
                console.warn('Redis connection error:', err)
            })
        } catch (error) {
            console.warn('Failed to initialize Redis client:', error)
            return null
        }
    }
    return redis
}

interface CacheOptions {
    /** Time to live in seconds */
    ttl?: number
    /** Revalidation tags (for future use with Next.js cache) */
    tags?: string[]
}

/**
 * Get data from cache
 * 
 * @param key - Cache key
 * @returns Cached data or null
 */
export async function getCache<T>(key: string): Promise<T | null> {
    const client = getRedisClient()
    if (!client) return null

    try {
        const data = await client.get(key)
        if (!data) return null
        return JSON.parse(data) as T
    } catch (error) {
        console.warn(`Cache get error for key ${key}:`, error)
        return null
    }
}

/**
 * Set data in cache
 * 
 * @param key - Cache key
 * @param data - Data to cache
 * @param options - Cache options (TTL, tags)
 */
export async function setCache<T>(key: string, data: T, options?: CacheOptions): Promise<void> {
    const client = getRedisClient()
    if (!client) return

    try {
        const serialized = JSON.stringify(data)
        if (options?.ttl) {
            await client.setex(key, options.ttl, serialized)
        } else {
            await client.set(key, serialized)
        }
    } catch (error) {
        console.warn(`Cache set error for key ${key}:`, error)
    }
}

/**
 * Delete data from cache
 * 
 * @param key - Cache key
 */
export async function deleteCache(key: string): Promise<void> {
    const client = getRedisClient()
    if (!client) return

    try {
        await client.del(key)
    } catch (error) {
        console.warn(`Cache delete error for key ${key}:`, error)
    }
}

/**
 * Get data from cache or fetch it if not present
 * 
 * @param key - Cache key
 * @param fetchFn - Function to fetch data if not cached
 * @param options - Cache options
 * @returns Cached or freshly fetched data
 */
export async function getOrSetCache<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options?: CacheOptions
): Promise<T> {
    const cached = await getCache<T>(key)
    if (cached) return cached

    const data = await fetchFn()

    // Cache the result if not undefined
    if (data !== undefined) {
        await setCache(key, data, options)
    }

    return data
}
