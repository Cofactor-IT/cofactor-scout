'use server'

import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { signUpSchema, type SignUpInput } from '@/lib/validation'
import { RateLimits } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'
import { randomBytes } from 'crypto'

// Simple in-memory store for rate limiting by email
const signupAttempts = new Map<string, { count: number; resetTime: number }>()
const passwordResetAttempts = new Map<string, { count: number; resetTime: number }>()

// Generate a cryptographically secure 6-digit code for password reset
function generateToken(): string {
    return crypto.randomInt(100000, 1000000).toString()
}

function generateSecureToken(): string {
    // Generate a secure random token for email verification
    return randomBytes(32).toString('hex')
}

// Generate a unique referral code based on username
async function generateUniqueReferralCode(name: string): Promise<string> {
    // Clean the name: remove spaces, special chars, convert to uppercase
    const cleanName = name
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .substring(0, 6) // Take first 6 chars

    // Generate a random 4 character suffix
    const randomSuffix = randomBytes(2).toString('hex').toUpperCase()

    // Combine: prefix + random suffix
    let code = `${cleanName}${randomSuffix}`

    // Ensure code is at least 4 characters
    if (code.length < 4) {
        code = code + randomBytes(3).toString('hex').toUpperCase()
    }

    // Check for uniqueness and regenerate if needed
    let attempts = 0
    while (attempts < 10) {
        const existing = await prisma.user.findUnique({
            where: { referralCode: code }
        })
        if (!existing) {
            return code
        }
        // Generate new code with different random part
        code = `${cleanName}${randomBytes(2).toString('hex').toUpperCase()}`
        attempts++
    }

    // Fallback: use timestamp + random
    return `USER${Date.now().toString(36).toUpperCase()}${randomBytes(2).toString('hex').toUpperCase()}`
}

export async function signUp(prevState: { error?: string; success?: string } | undefined, formData: FormData) {
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

    // Generate unique referral code based on username
    const newReferralCode = await generateUniqueReferralCode(name)

    // Generate email verification token (expires in 24 hours)
    const verificationToken = generateSecureToken()
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    try {
        await prisma.user.create({
            data: {
                email: validatedEmail,
                name,
                password: hashedPassword,
                role,
                referralCode: newReferralCode,
                verificationToken,
                verificationExpires,
                referredBy: referrerId ? {
                    create: {
                        referrerId: referrerId
                    }
                } : undefined
            }
        })

        // Referral record created via nested write, so we don't need manual create.

        if (referrerId) {
            // Increment referrer power score (+50)
            await prisma.user.update({
                where: { id: referrerId },
                data: { powerScore: { increment: 50 } }
            })
        }

        // Send Verification Email (Non-blocking)
        const { sendVerificationEmail } = await import('@/lib/email')
        sendVerificationEmail(validatedEmail, name, verificationToken).catch(err =>
            logger.error('Failed to send verification email', { email: validatedEmail, error: err })
        )

        logger.info('User registered successfully', { email: validatedEmail, role, referralCode: newReferralCode })

    } catch (e) {
        logger.error('Registration failed', { error: e })
        return { error: 'Registration failed' }
    }

    redirect('/auth/signin?message=Please check your email to verify your account')
}

export async function requestPasswordReset(prevState: { error?: string; success?: string } | undefined, formData: FormData) {
    const email = formData.get('email') as string
    if (!email) {
        return { error: 'Email is required' }
    }

    const rawEmail = email.toLowerCase().trim()

    // Rate limiting check for password reset
    const now = Date.now()
    const resetAttempt = passwordResetAttempts.get(rawEmail)

    if (!resetAttempt || now > resetAttempt.resetTime) {
        passwordResetAttempts.set(rawEmail, { count: 1, resetTime: now + RateLimits.PASSWORD_RESET.window })
    } else {
        resetAttempt.count++
        if (resetAttempt.count > RateLimits.PASSWORD_RESET.limit) {
            logger.warn('Rate limit exceeded for password reset', { email: rawEmail })
            return { error: 'Too many password reset attempts. Please try again later.' }
        }
    }

    const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() }
    })

    // Always show success message even if user doesn't exist (security)
    if (!user) {
        return { success: 'If an account exists with this email, you will receive a password reset code.' }
    }

    // Generate reset token (expires in 1 hour)
    const resetToken = generateToken()
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Delete any existing tokens for this user
    await prisma.passwordReset.deleteMany({
        where: { userId: user.id }
    })

    // Create new reset token
    await prisma.passwordReset.create({
        data: {
            token: resetToken,
            userId: user.id,
            expires
        }
    })

    // Send reset email (Non-blocking)
    const { sendPasswordResetEmail } = await import('@/lib/email')
    sendPasswordResetEmail(user.email, resetToken).catch(err =>
        logger.error('Failed to send password reset email', { email: user.email, error: err })
    )

    logger.info('Password reset requested', { email: user.email })

    return { success: 'If an account exists with this email, you will receive a password reset code.' }
}

export async function resetPassword(prevState: { error?: string; success?: string } | undefined, formData: FormData) {
    const token = formData.get('token') as string
    const password = formData.get('password') as string

    if (!token || !password) {
        return { error: 'Invalid request' }
    }

    if (password.length < 8) {
        return { error: 'Password must be at least 8 characters' }
    }

    // Find valid reset token
    const resetRecord = await prisma.passwordReset.findUnique({
        where: { token },
        include: { user: true }
    })

    if (!resetRecord) {
        return { error: 'Invalid or expired reset code' }
    }

    if (resetRecord.expires < new Date()) {
        // Delete expired token
        await prisma.passwordReset.delete({ where: { id: resetRecord.id } })
        return { error: 'Reset code has expired' }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update user password
    await prisma.user.update({
        where: { id: resetRecord.userId },
        data: { password: hashedPassword }
    })

    // Delete used token
    await prisma.passwordReset.delete({ where: { id: resetRecord.id } })

    logger.info('Password reset successful', { email: resetRecord.user.email })

    return { success: 'Your password has been reset. You can now sign in.' }
}

export async function resendVerificationEmail(prevState: { error?: string; success?: string } | undefined, formData: FormData) {
    const email = formData.get('email') as string
    if (!email) {
        return { error: 'Email is required' }
    }

    const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() }
    })

    if (!user) {
        return { error: 'No account found with this email' }
    }

    if (user.emailVerified) {
        return { success: 'Email is already verified.' }
    }

    // Generate new verification token
    const verificationToken = generateSecureToken()
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await prisma.user.update({
        where: { id: user.id },
        data: {
            verificationToken,
            verificationExpires
        }
    })

    // Send verification email
    const { sendVerificationEmail } = await import('@/lib/email')
    sendVerificationEmail(user.email, user.name || 'User', verificationToken).catch(err =>
        logger.error('Failed to send verification email', { email: user.email, error: err })
    )

    logger.info('Verification email resent', { email: user.email })

    return { success: 'Verification email sent. Please check your inbox.' }
}
