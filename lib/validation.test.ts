import { expect, test, describe } from 'vitest'
import { signInSchema } from './validation'

describe('signInSchema', () => {
    test('validates valid email and password', () => {
        const validData = {
            email: 'test@example.com',
            password: 'password123'
        }
        const result = signInSchema.safeParse(validData)
        expect(result.success).toBe(true)
    })

    test('validates email with mixed case (should normalize to lowercase)', () => {
        const data = {
            email: 'Test@Example.COM',
            password: 'password123'
        }
        const result = signInSchema.parse(data)
        expect(result.email).toBe('test@example.com')
    })

    test('fails with invalid email', () => {
        const invalidData = {
            email: 'invalid-email',
            password: 'password123'
        }
        const result = signInSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.issues[0].message).toBe('Invalid email address')
        }
    })

    test('fails with empty password', () => {
        const invalidData = {
            email: 'test@example.com',
            password: ''
        }
        const result = signInSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.issues[0].message).toBe('Password is required')
        }
    })

    test('fails with password too long', () => {
        const invalidData = {
            email: 'test@example.com',
            password: 'a'.repeat(129)
        }
        const result = signInSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
         if (!result.success) {
            expect(result.error.issues[0].message).toBe('Password is too long')
        }
    })

    test('fails with missing fields', () => {
        const invalidData = {}
        const result = signInSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
    })
})
