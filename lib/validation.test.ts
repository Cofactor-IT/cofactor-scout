import { describe, it, expect } from 'vitest'
import { socialConnectSchema } from './validation'

describe('socialConnectSchema', () => {
    describe('platform', () => {
        it('should accept valid platforms', () => {
            const platforms = ['instagram', 'tiktok', 'linkedin']
            platforms.forEach(platform => {
                const result = socialConnectSchema.safeParse({
                    platform,
                    username: 'validUser',
                    followers: 100
                })
                expect(result.success).toBe(true)
            })
        })

        it('should reject invalid platforms', () => {
            const result = socialConnectSchema.safeParse({
                platform: 'facebook',
                username: 'validUser',
                followers: 100
            })
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.errors[0].message).toBe('Invalid platform')
            }
        })
    })

    describe('username', () => {
        it('should accept valid usernames', () => {
            const result = socialConnectSchema.safeParse({
                platform: 'instagram',
                username: 'validUser123',
                followers: 100
            })
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.username).toBe('validUser123')
            }
        })

        it('should remove leading @', () => {
            const result = socialConnectSchema.safeParse({
                platform: 'instagram',
                username: '@validUser',
                followers: 100
            })
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.username).toBe('validUser')
            }
        })

        it('should reject empty username', () => {
             const result = socialConnectSchema.safeParse({
                platform: 'instagram',
                username: '',
                followers: 100
            })
            expect(result.success).toBe(false)
        })

        it('should reject whitespace-only username', () => {
             const result = socialConnectSchema.safeParse({
                platform: 'instagram',
                username: '   ',
                followers: 100
            })
            expect(result.success).toBe(false)
        })

        it('should reject too long username', () => {
             const result = socialConnectSchema.safeParse({
                platform: 'instagram',
                username: 'a'.repeat(101),
                followers: 100
            })
            expect(result.success).toBe(false)
        })
    })

    describe('followers', () => {
        it('should accept valid number', () => {
            const result = socialConnectSchema.safeParse({
                platform: 'instagram',
                username: 'validUser',
                followers: 500
            })
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.followers).toBe(500)
            }
        })

        it('should parse valid string number', () => {
            const result = socialConnectSchema.safeParse({
                platform: 'instagram',
                username: 'validUser',
                followers: '500'
            })
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.followers).toBe(500)
            }
        })

         it('should default to 0 if undefined', () => {
            const result = socialConnectSchema.safeParse({
                platform: 'instagram',
                username: 'validUser'
            })
             expect(result.success).toBe(true)
             if (result.success) {
                 expect(result.data.followers).toBe(0)
             }
        })

        it('should reject negative number', () => {
            const result = socialConnectSchema.safeParse({
                platform: 'instagram',
                username: 'validUser',
                followers: -1
            })
            expect(result.success).toBe(false)
        })

        it('should reject number too large', () => {
             const result = socialConnectSchema.safeParse({
                platform: 'instagram',
                username: 'validUser',
                followers: 1000000001
            })
            expect(result.success).toBe(false)
        })

        it('should reject invalid string', () => {
             const result = socialConnectSchema.safeParse({
                platform: 'instagram',
                username: 'validUser',
                followers: 'abc'
            })
            expect(result.success).toBe(false)
        })
    })
})
