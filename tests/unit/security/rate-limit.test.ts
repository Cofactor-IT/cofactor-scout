import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { checkRateLimit, cleanupRateLimitStore, RateLimitConfig } from '@/lib/security/rate-limit'

describe('checkRateLimit', () => {
    beforeEach(() => {
        vi.useFakeTimers()
        cleanupRateLimitStore()
    })

    afterEach(() => {
        vi.useRealTimers()
        cleanupRateLimitStore()
    })

    it('should allow first request and return correct remaining count', () => {
        const config: RateLimitConfig = { limit: 5, window: 60000 }
        const result = checkRateLimit('user1', config)

        expect(result.success).toBe(true)
        expect(result.remaining).toBe(4)
        expect(result.resetTime).toBe(Date.now() + 60000)
    })

    it('should decrement remaining count for subsequent requests', () => {
        const config: RateLimitConfig = { limit: 5, window: 60000 }
        checkRateLimit('user1', config) // 4 left
        const result = checkRateLimit('user1', config) // 3 left

        expect(result.success).toBe(true)
        expect(result.remaining).toBe(3)
    })

    it('should return success: false when limit is exceeded', () => {
        const config: RateLimitConfig = { limit: 2, window: 60000 }
        checkRateLimit('user1', config) // 1 left
        checkRateLimit('user1', config) // 0 left
        const result = checkRateLimit('user1', config) // exceeded

        expect(result.success).toBe(false)
        expect(result.remaining).toBe(0)
    })

    it('should reset limit after window expires', () => {
        const config: RateLimitConfig = { limit: 2, window: 60000 }
        checkRateLimit('user1', config)
        checkRateLimit('user1', config)

        // Verify limit reached
        expect(checkRateLimit('user1', config).success).toBe(false)

        // Advance time past window
        vi.advanceTimersByTime(60001)

        const result = checkRateLimit('user1', config)
        expect(result.success).toBe(true)
        expect(result.remaining).toBe(1)
    })

    it('should track different identifiers independently', () => {
        const config: RateLimitConfig = { limit: 2, window: 60000 }

        // Exhaust limit for user1
        checkRateLimit('user1', config)
        checkRateLimit('user1', config)
        expect(checkRateLimit('user1', config).success).toBe(false)

        // User2 should still have quota
        const result = checkRateLimit('user2', config)
        expect(result.success).toBe(true)
        expect(result.remaining).toBe(1)
    })
})
