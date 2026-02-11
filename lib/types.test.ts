import { describe, it, expect } from 'vitest'
import { calculateSocialReach, SocialStats } from './types'

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
