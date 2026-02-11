import { describe, it, expect } from 'vitest'
import { parseSocialStats } from './types'

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
