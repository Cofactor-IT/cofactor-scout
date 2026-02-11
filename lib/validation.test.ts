import { describe, it, expect } from 'vitest'
import { signUpSchema } from './validation'

describe('signUpSchema', () => {
    // Valid data
    it('should validate a correct sign up object', () => {
        const validData = {
            email: 'test@example.com',
            password: 'Password123!',
            name: 'John Doe',
            referralCode: 'REF123'
        }
        const result = signUpSchema.safeParse(validData)
        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data.email).toBe('test@example.com')
            expect(result.data.name).toBe('John Doe')
        }
    })

    // Email validation
    describe('email', () => {
        it('should reject invalid email format', () => {
            const result = signUpSchema.safeParse({
                email: 'invalid-email',
                password: 'Password123!',
                name: 'John Doe',
                referralCode: 'REF123'
            })
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.flatten().fieldErrors.email).toContain('Invalid email address')
            }
        })

        it('should reject email with SQL injection characters', () => {
             const result = signUpSchema.safeParse({
                email: "admin' --@example.com",
                password: 'Password123!',
                name: 'John Doe',
                referralCode: 'REF123'
            })
            expect(result.success).toBe(false)
            if (!result.success) {
                 expect(result.error.flatten().fieldErrors.email).toEqual(
                    expect.arrayContaining([expect.stringMatching(/Invalid email address|Invalid email format/)])
                 )
            }
        })
    })

    // Password validation
    describe('password', () => {
        it('should reject password shorter than 8 characters', () => {
            const result = signUpSchema.safeParse({
                email: 'test@example.com',
                password: 'Short1!',
                name: 'John Doe',
                referralCode: 'REF123'
            })
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.flatten().fieldErrors.password).toContain('Password must be at least 8 characters')
            }
        })

        it('should reject password without uppercase letter', () => {
            const result = signUpSchema.safeParse({
                email: 'test@example.com',
                password: 'password123!',
                name: 'John Doe',
                referralCode: 'REF123'
            })
            expect(result.success).toBe(false)
             if (!result.success) {
                expect(result.error.flatten().fieldErrors.password).toContain('Password must contain at least one uppercase letter')
            }
        })

        it('should reject password without lowercase letter', () => {
            const result = signUpSchema.safeParse({
                email: 'test@example.com',
                password: 'PASSWORD123!',
                name: 'John Doe',
                referralCode: 'REF123'
            })
            expect(result.success).toBe(false)
             if (!result.success) {
                expect(result.error.flatten().fieldErrors.password).toContain('Password must contain at least one lowercase letter')
            }
        })

         it('should reject password without number', () => {
            const result = signUpSchema.safeParse({
                email: 'test@example.com',
                password: 'Password!',
                name: 'John Doe',
                referralCode: 'REF123'
            })
            expect(result.success).toBe(false)
             if (!result.success) {
                expect(result.error.flatten().fieldErrors.password).toContain('Password must contain at least one number')
            }
        })

         it('should reject password without special character', () => {
            const result = signUpSchema.safeParse({
                email: 'test@example.com',
                password: 'Password123',
                name: 'John Doe',
                referralCode: 'REF123'
            })
            expect(result.success).toBe(false)
             if (!result.success) {
                expect(result.error.flatten().fieldErrors.password).toContain('Password must contain at least one special character')
            }
        })
    })

    // Name validation
    describe('name', () => {
        it('should reject name shorter than 2 characters', () => {
            const result = signUpSchema.safeParse({
                email: 'test@example.com',
                password: 'Password123!',
                name: 'J',
                referralCode: 'REF123'
            })
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.flatten().fieldErrors.name).toContain('Name must be at least 2 characters')
            }
        })

        it('should reject name with invalid characters', () => {
             const result = signUpSchema.safeParse({
                email: 'test@example.com',
                password: 'Password123!',
                name: 'John123', // Numbers not allowed in sanitizeName
                referralCode: 'REF123'
            })
            expect(result.success).toBe(false)
             if (!result.success) {
                 expect(result.error.flatten().fieldErrors.name).toContain('Name contains invalid characters')
            }
        })

        it('should sanitize valid name', () => {
             const result = signUpSchema.safeParse({
                email: 'test@example.com',
                password: 'Password123!',
                name: '  John Doe  ',
                referralCode: 'REF123'
            })
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.name).toBe('John Doe')
            }
        })
    })

    // Referral Code validation
    describe('referralCode', () => {
         it('should reject referral code with SQL injection', () => {
             const result = signUpSchema.safeParse({
                email: 'test@example.com',
                password: 'Password123!',
                name: 'John Doe',
                referralCode: "REF' OR '1'='1"
            })
            expect(result.success).toBe(false)
             if (!result.success) {
                expect(result.error.flatten().fieldErrors.referralCode).toContain('Invalid referral code')
            }
        })
    })
})
