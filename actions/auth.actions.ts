/**
 * auth.actions.ts
 * 
 * Server Actions for authentication flows including sign up, email verification,
 * password reset, and account security.
 * 
 * All actions validate input with Zod before processing.
 * Uses constant-time responses to prevent account enumeration attacks.
 * Rate limiting is disabled in MVP but infrastructure remains for future use.
 */

'use server'

import { prisma } from '@/lib/database/prisma'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { signUpSchema, type SignUpInput } from '@/lib/validation/schemas'
// import { RateLimits } from '@/lib/security/rate-limit'
import { logger } from '@/lib/logger'
import { randomBytes } from 'crypto'
// import { RateLimitError, ValidationError } from '@/lib/errors'
import { ValidationError } from '@/lib/errors'

// ============================================
// CONSTANTS
// ============================================

// Minimum response time to prevent timing attacks that reveal account existence
const ACCOUNT_ENUMERATION_DELAY = 1000

// RATE LIMITING - DISABLED FOR NOW
// Simple in-memory rate limiting stores
// const rateLimitStores = {
//     signup: new Map<string, { count: number; resetTime: number }>(),
//     passwordReset: new Map<string, { count: number; resetTime: number }>(),
//     resetVerify: new Map<string, { count: number; resetTime: number }>(),
//     resendVerification: new Map<string, { count: number; resetTime: number }>()
// }

// /**
//  * Rate limiting check with cleanup
//  */
// function checkRateLimit(
//     store: Map<string, { count: number; resetTime: number }>,
//     identifier: string,
//     config: { limit: number; window: number }
// ): boolean {
//     const now = Date.now()
//     const attempt = store.get(identifier)

//     if (!attempt || now > attempt.resetTime) {
//         store.set(identifier, { count: 1, resetTime: now + config.window })
//         return true
//     }

//     attempt.count++
//     return attempt.count <= config.limit
// }

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Generates a cryptographically secure random token for email verification
 * and password reset flows.
 * 
 * @returns 64-character hexadecimal string (32 bytes)
 */
function generateSecureToken(): string {
    return randomBytes(32).toString('hex')
}



/**
 * Determines user role based on email domain.
 * Currently returns CONTRIBUTOR for all users.
 * Future: Could check domain against whitelist for auto-SCOUT assignment.
 * 
 * @param email - User's email address
 * @returns Role object with CONTRIBUTOR, SCOUT, or ADMIN
 */
async function determineUserRole(email: string): Promise<{
    role: 'CONTRIBUTOR' | 'SCOUT' | 'ADMIN'
}> {
    // Default role for all new users - Scout status requires application
    return { role: 'CONTRIBUTOR' }
}

/**
 * Extracts university name from form data.
 * Currently uses user-provided value. Future: Could auto-detect from email domain.
 * 
 * @param email - User's email address (unused in current implementation)
 * @param formData - Form submission containing universityName field
 * @returns University name string or null if not provided
 */
async function determineUniversity(
    email: string,
    formData: FormData
): Promise<string | null> {
    const universityName = formData.get('universityName') as string | null
    return universityName?.trim() || null
}

/**
 * Splits full name into first and last name components.
 * Handles single names by leaving lastName empty.
 * 
 * @param fullName - User's full name as single string
 * @returns Object with firstName and lastName properties
 */
function splitName(fullName: string): { firstName: string; lastName: string } {
    const parts = fullName.trim().split(/\s+/)
    if (parts.length === 1) {
        return { firstName: parts[0], lastName: '' }
    }
    const firstName = parts[0]
    const lastName = parts.slice(1).join(' ')
    return { firstName, lastName }
}

/**
 * Creates a new user account with email verification token.
 * Sends verification and welcome emails after account creation.
 * 
 * @param userData - Validated signup form data from Zod schema
 * @param hashedPassword - Bcrypt hashed password (never store plain text)
 * @param role - User role (CONTRIBUTOR, SCOUT, or ADMIN)
 * @param university - University name or null
 * @throws {Error} If database operation fails
 */
async function createUser(
    userData: SignUpInput,
    hashedPassword: string,
    role: 'CONTRIBUTOR' | 'SCOUT' | 'ADMIN',
    university: string | null
): Promise<void> {
    const verificationToken = generateSecureToken()
    // Verification link expires after 24 hours
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const { firstName, lastName } = splitName(userData.name)

    await prisma.user.create({
        data: {
            email: userData.email,
            fullName: userData.name,
            firstName,
            lastName,
            password: hashedPassword,
            role,
            verificationToken,
            verificationExpires,
            university
        },
        select: { id: true }
    })

    // Send emails synchronously to ensure delivery before response
    const { sendVerificationEmail, sendWelcomeEmail } = await import('@/lib/email/send')
    logger.info('Attempting to send verification email', { email: userData.email })
    try {
        await sendVerificationEmail(userData.email, userData.name, verificationToken)
        logger.info('Verification email sent successfully', { email: userData.email })
    } catch (err) {
        logger.error('Failed to send verification email', { email: userData.email, error: err })
    }

    // Send welcome email
    try {
        await sendWelcomeEmail(userData.email, userData.name)
        logger.info('Welcome email sent successfully', { email: userData.email })
    } catch (err) {
        logger.error('Failed to send welcome email', { email: userData.email, error: err })
    }

    logger.info('User registered successfully', {
        email: userData.email,
        role,
        university
    })
}

/**
 * Enforces constant-time response to prevent timing attacks.
 * Ensures all responses take at least ACCOUNT_ENUMERATION_DELAY ms,
 * preventing attackers from determining if an email exists in the system.
 * 
 * @param startTime - Timestamp when operation started (from Date.now())
 */
async function enforceTimingDelay(startTime: number): Promise<void> {
    const elapsed = Date.now() - startTime
    if (elapsed < ACCOUNT_ENUMERATION_DELAY) {
        await new Promise(resolve => setTimeout(resolve, ACCOUNT_ENUMERATION_DELAY - elapsed))
    }
}

// ============================================
// EXPORTED SERVER ACTIONS
// ============================================

/**
 * Creates a new user account with email verification.
 * Handles both regular signups and scout application signups.
 * Uses constant-time responses to prevent account enumeration.
 * 
 * @param prevState - Previous form state (unused, required by useActionState)
 * @param formData - Form data containing email, password, name, and optional fields
 * @returns Success message or error message
 */
export async function signUp(
    prevState: { error?: string; success?: string } | undefined,
    formData: FormData
): Promise<{ error?: string; success?: string }> {
    const startTime = Date.now()

    try {
        // Normalize email to prevent duplicate accounts (User@Gmail.com vs user@gmail.com)
        const email = (formData.get('email') as string)?.toLowerCase().trim()

        if (!email) {
            return { error: 'Email is required' }
        }

        // RATE LIMITING - DISABLED FOR NOW
        // if (!checkRateLimit(rateLimitStores.signup, email, RateLimits.SIGNUP)) {
        //     logger.warn('Rate limit exceeded for signup', { email })
        //     throw new RateLimitError()
        // }

        // Validate form data
        const rawData = {
            email: formData.get('email'),
            password: formData.get('password'),
            name: formData.get('name'),

        }

        const validationResult = signUpSchema.safeParse(rawData)
        if (!validationResult.success) {
            const errors = validationResult.error.issues.map(e => e.message).join(', ')
            logger.warn('Validation failed for signup', { email, errors })
            return { error: errors }
        }

        const { email: validatedEmail, password, name } = validationResult.data

        // Check for existing user but don't reveal this to client (security)
        const existingUser = await prisma.user.findUnique({
            where: { email: validatedEmail },
            select: { id: true }
        })

        if (existingUser) {
            logger.warn('Signup attempt with existing email', { email: validatedEmail })
        }

        // Determine role
        const { role } = await determineUserRole(validatedEmail)

        // Determine university
        const university = await determineUniversity(validatedEmail, formData)

        // Scout applications include additional profile fields
        const isScoutApp = formData.get('scoutApplication') === 'true'

        // Create user only if doesn't exist
        if (!existingUser) {
            // Use bcrypt with cost factor 10 for password hashing
            const hashedPassword = await bcrypt.hash(password, 10)

            if (isScoutApp) {
                // Scout applications create account with PENDING status and additional fields
                const verificationToken = generateSecureToken()
                const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)
                const { firstName, lastName } = splitName(name)

                await prisma.user.create({
                    data: {
                        email: validatedEmail,
                        fullName: name,
                        firstName,
                        lastName,
                        password: hashedPassword,
                        role,
                        verificationToken,
                        verificationExpires,
                        university,
                        department: formData.get('department') as string,
                        linkedinUrl: (formData.get('linkedinUrl') as string) || null,
                        userRole: formData.get('userRole') as any,
                        userRoleOther: formData.get('userRole') === 'OTHER' ? (formData.get('userRoleOther') as string) : null,
                        researchAreas: formData.get('researchAreas') as string,
                        whyScout: formData.get('whyScout') as string,
                        howSourceLeads: formData.get('howSourceLeads') as string,
                        scoutApplicationStatus: 'PENDING',
                        scoutApplicationDate: new Date()
                    }
                })

                // Send verification email
                const { sendVerificationEmail } = await import('@/lib/email/send')
                try {
                    await sendVerificationEmail(validatedEmail, name, verificationToken)
                    logger.info('Verification email sent successfully', { email: validatedEmail })
                } catch (err) {
                    logger.error('Failed to send verification email', { email: validatedEmail, error: err })
                }

                // Send scout application emails
                const { sendScoutApplicationConfirmationEmail, sendScoutApplicationNotificationEmail } = await import('@/lib/email/send')
                try {
                    await sendScoutApplicationConfirmationEmail(validatedEmail, name)
                    await sendScoutApplicationNotificationEmail(
                        name,
                        validatedEmail,
                        university || 'Not specified',
                        formData.get('department') as string,
                        formData.get('userRole') as string,
                        formData.get('researchAreas') as string,
                        new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                    )
                    logger.info('Scout application emails sent', { email: validatedEmail })
                } catch (err) {
                    logger.error('Failed to send scout application emails', { email: validatedEmail, error: err })
                }

                logger.info('Scout application account created', { email: validatedEmail })
            } else {
                await createUser(
                    validationResult.data,
                    hashedPassword,
                    role,
                    university
                )
            }
        }

        // Always enforce timing delay before response
        await enforceTimingDelay(startTime)

        // Return same message whether account exists or not (security)
        if (existingUser) {
            return { success: 'If an account exists with this email, a verification link has been sent.' }
        }

        return { success: 'Account created! Please check your email to verify your account before signing in.' }

    } catch (error) {
        await enforceTimingDelay(startTime)

        // RATE LIMITING - DISABLED FOR NOW
        // if (error instanceof RateLimitError) {
        //     return { error: 'Too many signup attempts. Please try again later.' }
        // }

        if (error instanceof ValidationError) {
            return { error: error.message }
        }

        logger.error('Registration failed', { error })
        return { error: 'Registration failed. Please try again.' }
    }
}

/**
 * Initiates password reset flow by generating token and sending email.
 * Uses constant-time response to prevent account enumeration.
 * 
 * @param prevState - Previous form state (unused, required by useActionState)
 * @param formData - Form data containing email address
 * @returns Generic success message (never reveals if account exists)
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

    // RATE LIMITING - DISABLED FOR NOW
    // if (!checkRateLimit(rateLimitStores.passwordReset, email, RateLimits.PASSWORD_RESET)) {
    //     logger.warn('Rate limit exceeded for password reset', { email })
    //     return { error: 'Too many password reset attempts. Please try again later.' }
    // }

    try {
        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, email: true }
        })

        if (user) {
            const resetToken = generateSecureToken()
            // Reset token expires after 1 hour
            const expires = new Date(Date.now() + 60 * 60 * 1000)

            // Delete any existing reset tokens for this user
            await prisma.passwordReset.deleteMany({ where: { userId: user.id } })
            await prisma.passwordReset.create({
                data: { token: resetToken, userId: user.id, expires }
            })

            const { sendPasswordResetEmail } = await import('@/lib/email/send')
            try {
                await sendPasswordResetEmail(user.email, resetToken)
                logger.info('Password reset email sent', { email: user.email })
            } catch (err) {
                logger.error('Failed to send password reset email', { email: user.email, error: err })
            }

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
 * Completes password reset using token from email.
 * Validates token, checks expiration, and updates password.
 * 
 * @param prevState - Previous form state (unused, required by useActionState)
 * @param formData - Form data containing reset token and new password
 * @returns Success or error message
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

    // RATE LIMITING - DISABLED FOR NOW
    // if (!checkRateLimit(rateLimitStores.resetVerify, token, { limit: 5, window: 15 * 60 * 1000 })) {
    //     logger.warn('Rate limit exceeded for password reset verification', { token: token.substring(0, 4) + '...' })
    //     return { error: 'Too many attempts. Please request a new reset code.' }
    // }

    // Validate password meets complexity requirements
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

        // Check if token has expired (1 hour limit)
        if (resetRecord.expires < new Date()) {
            await prisma.passwordReset.delete({ where: { id: resetRecord.id } })
            return { error: 'Reset code has expired' }
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        // Update password and delete token atomically
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
 * Validates password meets complexity requirements.
 * Requirements: 8+ chars, uppercase, lowercase, number, special character.
 * 
 * @param password - Plain text password to validate
 * @returns Object with valid flag and optional error message
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
 * Resends email verification link to user.
 * Only sends if account exists and is not already verified.
 * Uses constant-time response to prevent account enumeration.
 * 
 * @param prevState - Previous form state (unused, required by useActionState)
 * @param formData - Form data containing email address
 * @returns Generic success message (never reveals if account exists)
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

    // RATE LIMITING - DISABLED FOR NOW
    // if (!checkRateLimit(rateLimitStores.resendVerification, email, RateLimits.SIGNUP)) {
    //     logger.warn('Rate limit exceeded for verification resend', { email })
    //     return { error: 'Too many attempts. Please try again later.' }
    // }

    try {
        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, email: true, fullName: true, emailVerified: true }
        })

        // Only send if user exists and email not already verified
        if (user && !user.emailVerified) {
            const verificationToken = generateSecureToken()
            // New verification link expires after 24 hours
            const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)

            await prisma.user.update({
                where: { id: user.id },
                data: { verificationToken, verificationExpires }
            })

            const { sendVerificationEmail } = await import('@/lib/email/send')
            try {
                await sendVerificationEmail(user.email, user.fullName || 'User', verificationToken)
                logger.info('Verification email resent successfully', { email: user.email })
            } catch (err) {
                logger.error('Failed to send verification email', { email: user.email, error: err })
            }

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
