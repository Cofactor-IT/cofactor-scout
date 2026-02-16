'use server'

import { prisma } from '@/lib/database/prisma'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { signUpSchema, type SignUpInput } from '@/lib/validation/schemas'
import { RateLimits } from '@/lib/security/rate-limit'
import { logger } from '@/lib/logger'
import { randomBytes } from 'crypto'
import { RateLimitError, ValidationError } from '@/lib/errors'

// Account enumeration prevention delay
const ACCOUNT_ENUMERATION_DELAY = 1000

// Simple in-memory rate limiting stores
const rateLimitStores = {
    signup: new Map<string, { count: number; resetTime: number }>(),
    passwordReset: new Map<string, { count: number; resetTime: number }>(),
    resetVerify: new Map<string, { count: number; resetTime: number }>(),
    resendVerification: new Map<string, { count: number; resetTime: number }>()
}

/**
 * Rate limiting check with cleanup
 */
function checkRateLimit(
    store: Map<string, { count: number; resetTime: number }>,
    identifier: string,
    config: { limit: number; window: number }
): boolean {
    const now = Date.now()
    const attempt = store.get(identifier)

    if (!attempt || now > attempt.resetTime) {
        store.set(identifier, { count: 1, resetTime: now + config.window })
        return true
    }

    attempt.count++
    return attempt.count <= config.limit
}

/**
 * Generate secure random token
 */
function generateSecureToken(): string {
    return randomBytes(32).toString('hex')
}

/**
 * Generate unique referral code
 */
async function generateUniqueReferralCode(): Promise<string> {
    const maxAttempts = 10

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const randomPart = randomBytes(16).toString('hex').toUpperCase()
        const code = randomPart.substring(0, 16)

        const existing = await prisma.user.findUnique({
            where: { referralCode: code },
            select: { id: true }
        })

        if (!existing) {
            return code
        }
    }

    // Fallback with timestamp
    return `USER${Date.now().toString(36).toUpperCase()}${randomBytes(4).toString('hex').toUpperCase()}`
}

/**
 * Determine user role based on referral code and email domain
 */
async function determineUserRole(email: string, referralCode?: string): Promise<{
    role: 'STUDENT' | 'PENDING_STAFF' | 'STAFF'
    referrerId: string | null
}> {
    const STAFF_SECRET = process.env.STAFF_SECRET_CODE

    // Check for staff secret code
    if (STAFF_SECRET && referralCode === STAFF_SECRET) {
        return { role: 'PENDING_STAFF', referrerId: null }
    }

    // Check email domain for staff access
    const emailDomain = email.split('@')[1]?.toLowerCase()
    if (emailDomain) {
        const staffDomain = await prisma.staffDomain.findUnique({
            where: { domain: emailDomain },
            select: { id: true }
        })

        if (staffDomain) {
            logger.info('User assigned STAFF role via domain match', { email, domain: emailDomain })
            return { role: 'STAFF', referrerId: null }
        }
    }

    // If no referral code provided, allow signup without referrer
    if (!referralCode || referralCode.trim() === '') {
        return { role: 'STUDENT', referrerId: null }
    }

    // Validate referral code for regular signup
    const referrer = await prisma.user.findUnique({
        where: { referralCode },
        select: { id: true }
    })

    if (!referrer) {
        throw new ValidationError('Invalid referral code')
    }

    return { role: 'STUDENT', referrerId: referrer.id }
}

/**
 * Determine university ID based on email domain and form data
 */
async function determineUniversity(
    email: string,
    formData: FormData
): Promise<string | null> {
    const universityIdFromForm = formData.get('universityId') as string | null
    const universityName = formData.get('universityName') as string | null

    // Import university utilities
    const { extractEmailDomain, isPersonalEmail, findUniversityByDomain, createPendingUniversity } =
        await import('@/lib/utils/university')

    const emailDomain = extractEmailDomain(email)

    // Use pre-selected university if provided
    if (universityIdFromForm) {
        const existingUni = await prisma.university.findUnique({
            where: { id: universityIdFromForm },
            select: { id: true }
        })
        return existingUni?.id || null
    }

    // Try to match by email domain
    if (!isPersonalEmail(email) && emailDomain) {
        const foundUniversity = await findUniversityByDomain(emailDomain)
        if (foundUniversity) {
            return foundUniversity.id
        }
    }

    // Create pending university if name provided
    if (universityName?.trim()) {
        const normalizedName = universityName.trim()

        // Check existing by name
        const existingByName = await prisma.university.findFirst({
            where: {
                name: { equals: normalizedName, mode: 'insensitive' }
            },
            select: { id: true }
        })

        if (existingByName) {
            return existingByName.id
        }

        // Create new pending university
        try {
            const newUniversity = await createPendingUniversity(normalizedName, emailDomain || '')
            return newUniversity.id
        } catch (e) {
            logger.warn('Failed to create pending university', { name: normalizedName, error: e })
            return null
        }
    }

    return null
}

/**
 * Create user with referral relationship
 */
async function createUserWithReferral(
    userData: SignUpInput,
    hashedPassword: string,
    referralCode: string,
    role: 'STUDENT' | 'PENDING_STAFF' | 'STAFF',
    universityId: string | null,
    referrerId: string | null
): Promise<void> {
    const verificationToken = generateSecureToken()
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                email: userData.email,
                name: userData.name,
                password: hashedPassword,
                role,
                referralCode,
                verificationToken,
                verificationExpires,
                universityId,
                referredBy: referrerId ? { create: { referrerId } } : undefined
            },
            select: { id: true }
        })

        if (referrerId) {
            await tx.user.update({
                where: { id: referrerId },
                data: { powerScore: { increment: 50 } }
            })
        }
    })

    // Send verification email asynchronously
    const { sendVerificationEmail } = await import('@/lib/email/send')
    sendVerificationEmail(userData.email, userData.name, verificationToken)
        .catch(err => logger.error('Failed to send verification email', { email: userData.email, error: err }))

    logger.info('User registered successfully', {
        email: userData.email,
        role,
        referralCode,
        universityId
    })
}

/**
 * Enforce constant timing delay for security
 */
async function enforceTimingDelay(startTime: number): Promise<void> {
    const elapsed = Date.now() - startTime
    if (elapsed < ACCOUNT_ENUMERATION_DELAY) {
        await new Promise(resolve => setTimeout(resolve, ACCOUNT_ENUMERATION_DELAY - elapsed))
    }
}

/**
 * Main signup function - refactored into smaller, testable steps
 */
export async function signUp(
    prevState: { error?: string; success?: string } | undefined,
    formData: FormData
): Promise<{ error?: string; success?: string }> {
    const startTime = Date.now()

    try {
        // Extract and validate email first for rate limiting
        const email = (formData.get('email') as string)?.toLowerCase().trim()

        if (!email) {
            return { error: 'Email is required' }
        }

        // Rate limiting
        if (!checkRateLimit(rateLimitStores.signup, email, RateLimits.SIGNUP)) {
            logger.warn('Rate limit exceeded for signup', { email })
            throw new RateLimitError()
        }

        // Validate form data
        const rawData = {
            email: formData.get('email'),
            password: formData.get('password'),
            name: formData.get('name'),
            referralCode: formData.get('referralCode')
        }

        const validationResult = signUpSchema.safeParse(rawData)
        if (!validationResult.success) {
            const errors = validationResult.error.issues.map(e => e.message).join(', ')
            logger.warn('Validation failed for signup', { email, errors })
            return { error: errors }
        }

        const { email: validatedEmail, password, name, referralCode } = validationResult.data

        // Check for existing user
        const existingUser = await prisma.user.findUnique({
            where: { email: validatedEmail },
            select: { id: true }
        })

        if (existingUser) {
            logger.warn('Signup attempt with existing email', { email: validatedEmail })
        }

        // Determine role and referrer
        const { role, referrerId } = await determineUserRole(validatedEmail, referralCode)

        // Determine university
        const universityId = await determineUniversity(validatedEmail, formData)

        // Create user only if doesn't exist
        if (!existingUser) {
            const hashedPassword = await bcrypt.hash(password, 10)
            const newReferralCode = await generateUniqueReferralCode()

            await createUserWithReferral(
                validationResult.data,
                hashedPassword,
                newReferralCode,
                role,
                universityId,
                referrerId
            )
        }

        // Enforce timing delay
        await enforceTimingDelay(startTime)

        if (existingUser) {
            return { success: 'If an account exists with this email, a verification link has been sent.' }
        }

        redirect('/auth/signin?message=Please check your email to verify your account')

    } catch (error) {
        await enforceTimingDelay(startTime)

        if (error instanceof RateLimitError) {
            return { error: 'Too many signup attempts. Please try again later.' }
        }

        if (error instanceof ValidationError) {
            return { error: error.message }
        }

        logger.error('Registration failed', { error })
        return { error: 'Registration failed. Please try again.' }
    }
}

/**
 * Request password reset
 */
export async function requestPasswordReset(
    prevState: { error?: string; success?: string } | undefined,
    formData: FormData
): Promise<{ error?: string; success?: string }> {
    const startTime = Date.now()
    const email = (formData.get('email') as string)?.toLowerCase().trim()

    if (!email) {
        return { error: 'Email is required' }
    }

    // Rate limiting
    if (!checkRateLimit(rateLimitStores.passwordReset, email, RateLimits.PASSWORD_RESET)) {
        logger.warn('Rate limit exceeded for password reset', { email })
        return { error: 'Too many password reset attempts. Please try again later.' }
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, email: true }
        })

        if (user) {
            const resetToken = generateSecureToken()
            const expires = new Date(Date.now() + 60 * 60 * 1000)

            await prisma.passwordReset.deleteMany({ where: { userId: user.id } })
            await prisma.passwordReset.create({
                data: { token: resetToken, userId: user.id, expires }
            })

            const { sendPasswordResetEmail } = await import('@/lib/email/send')
            sendPasswordResetEmail(user.email, resetToken).catch(err =>
                logger.error('Failed to send password reset email', { email: user.email, error: err })
            )

            logger.info('Password reset requested', { email: user.email })
        }

        await enforceTimingDelay(startTime)

        return { success: 'If an account exists with this email, you will receive a password reset code.' }

    } catch (error) {
        await enforceTimingDelay(startTime)
        logger.error('Password reset request failed', { error })
        return { error: 'An error occurred. Please try again.' }
    }
}

/**
 * Reset password with token
 */
export async function resetPassword(
    prevState: { error?: string; success?: string } | undefined,
    formData: FormData
): Promise<{ error?: string; success?: string }> {
    const token = formData.get('token') as string
    const password = formData.get('password') as string

    if (!token || !password) {
        return { error: 'Invalid request' }
    }

    // Rate limiting
    if (!checkRateLimit(rateLimitStores.resetVerify, token, { limit: 5, window: 15 * 60 * 1000 })) {
        logger.warn('Rate limit exceeded for password reset verification', { token: token.substring(0, 4) + '...' })
        return { error: 'Too many attempts. Please request a new reset code.' }
    }

    // Validate password
    const passwordValidation = validatePasswordComplexity(password)
    if (!passwordValidation.valid) {
        return { error: passwordValidation.error }
    }

    try {
        const resetRecord = await prisma.passwordReset.findUnique({
            where: { token },
            include: { user: { select: { id: true, email: true } } }
        })

        if (!resetRecord) {
            return { error: 'Invalid or expired reset code' }
        }

        if (resetRecord.expires < new Date()) {
            await prisma.passwordReset.delete({ where: { id: resetRecord.id } })
            return { error: 'Reset code has expired' }
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        await prisma.$transaction([
            prisma.user.update({
                where: { id: resetRecord.userId },
                data: { password: hashedPassword }
            }),
            prisma.passwordReset.delete({ where: { id: resetRecord.id } })
        ])

        logger.info('Password reset successful', { email: resetRecord.user.email })
        return { success: 'Your password has been reset. You can now sign in.' }

    } catch (error) {
        logger.error('Password reset failed', { error })
        return { error: 'Failed to reset password. Please try again.' }
    }
}

/**
 * Validate password complexity
 */
function validatePasswordComplexity(password: string): { valid: true } | { valid: false; error: string } {
    if (password.length < 8) {
        return { valid: false, error: 'Password must be at least 8 characters' }
    }
    if (!/[A-Z]/.test(password)) {
        return { valid: false, error: 'Password must contain at least one uppercase letter' }
    }
    if (!/[a-z]/.test(password)) {
        return { valid: false, error: 'Password must contain at least one lowercase letter' }
    }
    if (!/[0-9]/.test(password)) {
        return { valid: false, error: 'Password must contain at least one number' }
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
        return { valid: false, error: 'Password must contain at least one special character' }
    }
    return { valid: true }
}

/**
 * Resend verification email
 */
export async function resendVerificationEmail(
    prevState: { error?: string; success?: string } | undefined,
    formData: FormData
): Promise<{ error?: string; success?: string }> {
    const startTime = Date.now()
    const email = (formData.get('email') as string)?.toLowerCase().trim()

    if (!email) {
        return { error: 'Email is required' }
    }

    // Rate limiting
    if (!checkRateLimit(rateLimitStores.resendVerification, email, RateLimits.SIGNUP)) {
        logger.warn('Rate limit exceeded for verification resend', { email })
        return { error: 'Too many attempts. Please try again later.' }
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, email: true, name: true, emailVerified: true }
        })

        if (user && !user.emailVerified) {
            const verificationToken = generateSecureToken()
            const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)

            await prisma.user.update({
                where: { id: user.id },
                data: { verificationToken, verificationExpires }
            })

            const { sendVerificationEmail } = await import('@/lib/email/send')
            sendVerificationEmail(user.email, user.name || 'User', verificationToken).catch(err =>
                logger.error('Failed to send verification email', { email: user.email, error: err })
            )

            logger.info('Verification email resent', { email: user.email })
        }

        await enforceTimingDelay(startTime)

        return { success: 'If an account exists with this email, a verification link has been sent.' }

    } catch (error) {
        await enforceTimingDelay(startTime)
        logger.error('Resend verification failed', { error })
        return { error: 'An error occurred. Please try again.' }
    }
}
