'use server'

import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { signUpSchema, type SignUpInput } from '@/lib/validation'
import { RateLimits } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

// Simple in-memory store for rate limiting by email
const signupAttempts = new Map<string, { count: number; resetTime: number }>()

export async function signUp(prevState: { error?: string } | undefined, formData: FormData) {
    // Extract form data first to get email for rate limiting
    const email = formData.get('email') as string
    const rawEmail = email?.toLowerCase().trim()

    // Rate limiting check
    if (rawEmail) {
        const now = Date.now()
        const attempt = signupAttempts.get(rawEmail)

        if (!attempt || now > attempt.resetTime) {
            signupAttempts.set(rawEmail, { count: 1, resetTime: now + RateLimits.SIGNUP.window })
        } else {
            attempt.count++
            if (attempt.count > RateLimits.SIGNUP.limit) {
                logger.warn('Rate limit exceeded for signup', { email: rawEmail })
                return { error: `Too many signup attempts. Please try again later.` }
            }
        }
    }

    // Extract and validate form data
    const rawData = {
        email: formData.get('email'),
        password: formData.get('password'),
        name: formData.get('name'),
        referralCode: formData.get('referralCode')
    }

    const validationResult = signUpSchema.safeParse(rawData)
    if (!validationResult.success) {
        const errors = validationResult.error.issues.map((e: { message: string }) => e.message).join(', ')
        logger.warn('Validation failed for signup', { errors })
        return { error: errors }
    }

    const { email: validatedEmail, password, name, referralCode } = validationResult.data as SignUpInput

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
        where: { email: validatedEmail }
    })
    if (existingUser) {
        logger.warn('Signup attempt with existing email', { email: validatedEmail })
        return { error: 'Email already exists' }
    }

    // Role Logic
    let role: 'STUDENT' | 'PENDING_STAFF' = 'STUDENT'
    let referrerId: string | null = null

    const STAFF_SECRET = process.env.STAFF_SECRET_CODE

    if (STAFF_SECRET && referralCode === STAFF_SECRET) {
        role = 'PENDING_STAFF'
    } else {
        // Must be a valid referrer code
        const referrer = await prisma.user.findUnique({
            where: { referralCode }
        })

        if (!referrer) {
            return { error: 'Invalid referral code' }
        }
        referrerId = referrer.id
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate own referral code (simple mock logic)
    // In prod, ensure uniqueness
    const newReferralCode = name.substring(0, 3).toUpperCase() + Math.floor(Math.random() * 10000).toString()

    try {
        await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                role,
                referralCode: newReferralCode,
                referredBy: referrerId ? {
                    create: {
                        referrerId: referrerId
                    }
                } : undefined
            }
        })

        // Referral record created via nested write, so we don't need manual create.

        if (referrerId) {
            // Check if nested create worked? Yes it should.
            // Just increment referrer power score (+50)
            await prisma.user.update({
                where: { id: referrerId },
                data: { powerScore: { increment: 50 } }
            })
        }

        // Send Welcome Email (Non-blocking)
        const { sendWelcomeEmail } = await import('@/lib/email')
        sendWelcomeEmail(validatedEmail, name).catch(err =>
            logger.error('Failed to send welcome email', { email: validatedEmail, error: err })
        )

        logger.info('User registered successfully', { email: validatedEmail, role })

    } catch (e) {
        logger.error('Registration failed', { error: e })
        return { error: 'Registration failed' }
    }

    redirect('/api/auth/signin')
}
