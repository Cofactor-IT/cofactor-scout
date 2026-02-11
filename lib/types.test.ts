import { describe, it, expect } from 'vitest'
import { calculateSocialReach, SocialStats, parseSocialStats } from './types'

describe('calculateSocialReach', () => {
  it('should return 0 when all stats are undefined', () => {
    const stats: SocialStats = {}
    expect(calculateSocialReach(stats)).toBe(0)
  })

  it('should return 0 when all stats are 0', () => {
    const stats: SocialStats = {
      instagram: 0,
      tiktok: 0,
      linkedin: 0
    }
    expect(calculateSocialReach(stats)).toBe(0)
  })

  it('should correctly sum values when all are present', () => {
    const stats: SocialStats = {
      instagram: 100,
      tiktok: 200,
      linkedin: 300
    }
    expect(calculateSocialReach(stats)).toBe(600)
  })

  it('should correctly sum values when some are undefined', () => {
    const stats: SocialStats = {
      instagram: 100,
      linkedin: 300
    }
    expect(calculateSocialReach(stats)).toBe(400)
  })

  it('should handle large numbers correctly', () => {
    const stats: SocialStats = {
      instagram: 1000000,
      tiktok: 2000000,
      linkedin: 3000000
    }
    expect(calculateSocialReach(stats)).toBe(6000000)
  })

  it('should handle negative numbers if they occur', () => {
    const stats: SocialStats = {
      instagram: 100,
      tiktok: -50,
      linkedin: 20
    }
    expect(calculateSocialReach(stats)).toBe(70)
  })
})

describe('parseSocialStats', () => {
  it('should parse valid social stats object', () => {
    const input = {
      instagram: 100,
      tiktok: 200,
      linkedin: 300,
    }
    const result = parseSocialStats(input)
    expect(result).toEqual({
      instagram: 100,
      tiktok: 200,
      linkedin: 300,
    })
  })

  it('should handle partial input and default missing keys to 0', () => {
    const input = {
      instagram: 100,
    }
    const result = parseSocialStats(input)
    expect(result).toEqual({
      instagram: 100,
      tiktok: 0,
      linkedin: 0,
    })
  })

  it('should handle non-number values and default them to 0', () => {
    const input = {
      instagram: '100', // string, not number
      tiktok: null,
      linkedin: undefined,
    }
    const result = parseSocialStats(input)
    expect(result).toEqual({
      instagram: 0,
      tiktok: 0,
      linkedin: 0,
    })
  })

  it('should handle null input', () => {
    const result = parseSocialStats(null)
    expect(result).toEqual({
      instagram: 0,
      tiktok: 0,
      linkedin: 0,
    })
  })

  it('should handle undefined input', () => {
    const result = parseSocialStats(undefined)
    expect(result).toEqual({
      instagram: 0,
      tiktok: 0,
      linkedin: 0,
    })
  })

  it('should handle empty object', () => {
    const result = parseSocialStats({})
    expect(result).toEqual({
      instagram: 0,
      tiktok: 0,
      linkedin: 0,
    })
  })

  it('should handle array input (technically an object) gracefully', () => {
    // Arrays are objects in JS, but won't have the named properties
    const result = parseSocialStats([1, 2, 3])
    expect(result).toEqual({
      instagram: 0,
      tiktok: 0,
      linkedin: 0,
    })
  })

  it('should handle primitive inputs that are not objects', () => {
    expect(parseSocialStats('string')).toEqual({ instagram: 0, tiktok: 0, linkedin: 0 })
    expect(parseSocialStats(123)).toEqual({ instagram: 0, tiktok: 0, linkedin: 0 })
    expect(parseSocialStats(true)).toEqual({ instagram: 0, tiktok: 0, linkedin: 0 })
  })

  it('should ignore extra properties', () => {
    const input = {
      instagram: 100,
      extra: 'value'
    }
    const result = parseSocialStats(input)
    expect(result).toEqual({
      instagram: 100,
      tiktok: 0,
      linkedin: 0
    })
    // The implementation creates a new object, so extra props should be gone.
    expect((result as any).extra).toBeUndefined()
  })
})
