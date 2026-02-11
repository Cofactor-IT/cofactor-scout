import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { checkRateLimit, cleanupRateLimitStore, RateLimitConfig } from './rate-limit'

describe('checkRateLimit', () => {
  beforeEach(() => {
    // Reset the store before each test
    cleanupRateLimitStore()
    // Use fake timers to control Date.now()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should allow a request and return correct remaining count', () => {
    const config: RateLimitConfig = { limit: 5, window: 60000 }
    const result = checkRateLimit('user1', config)

    expect(result.success).toBe(true)
    expect(result.remaining).toBe(4)
    expect(result.resetTime).toBe(Date.now() + 60000)
  })

  it('should decrement remaining count for subsequent requests', () => {
    const config: RateLimitConfig = { limit: 5, window: 60000 }
    checkRateLimit('user1', config)
    const result = checkRateLimit('user1', config)

    expect(result.success).toBe(true)
    expect(result.remaining).toBe(3)
  })

  it('should block requests when limit is exceeded', () => {
    const config: RateLimitConfig = { limit: 2, window: 60000 }
    checkRateLimit('user1', config) // remaining: 1
    checkRateLimit('user1', config) // remaining: 0

    const result = checkRateLimit('user1', config) // limit exceeded

    expect(result.success).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('should reset the limit after the window expires', () => {
    const config: RateLimitConfig = { limit: 2, window: 60000 }
    checkRateLimit('user1', config)
    checkRateLimit('user1', config)

    // Verify blocked
    expect(checkRateLimit('user1', config).success).toBe(false)

    // Advance time past the window
    vi.advanceTimersByTime(60001)

    // Should be allowed again
    const result = checkRateLimit('user1', config)
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(1)
  })

  it('should track different identifiers independently', () => {
    const config: RateLimitConfig = { limit: 2, window: 60000 }

    checkRateLimit('user1', config)
    checkRateLimit('user1', config)

    // user1 is blocked
    expect(checkRateLimit('user1', config).success).toBe(false)

    // user2 should be allowed
    const result = checkRateLimit('user2', config)
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(1)
  })
})
