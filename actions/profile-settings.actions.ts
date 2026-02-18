'use server'

import { prisma } from '@/lib/database/prisma'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import bcrypt from 'bcryptjs'
import {
    profileUpdateSchema,
    nameFieldSchema,
    bioFieldSchema
} from '@/lib/validation/schemas'
import {
    sanitizeName,
    sanitizeBio,
    containsSqlInjection
} from '@/lib/security/sanitization'
import { generateSlug } from '@/lib/utils/formatting'
import { validateContent, filterContent } from '@/lib/moderation/content-filter'
import { logger } from '@/lib/logger'
import { ValidationError, NotFoundError, AuthenticationError } from '@/lib/errors'

/**
 * Sanitize and validate name field
 */
function validateAndSanitizeName(rawName: string | null) {
    if (!rawName) {
        return { valid: false, error: 'Name is required' }
    }

    const validation = nameFieldSchema.safeParse(rawName)
    if (!validation.success) {
        return {
            valid: false,
            error: validation.error.issues.map(i => i.message).join(', ')
        }
    }

    const sanitization = sanitizeName(rawName)
    if (!sanitization.isValid) {
        return { valid: false, error: sanitization.error || 'Invalid name format' }
    }

    return { valid: true, sanitized: sanitization.sanitized }
}

/**
 * Validate and sanitize bio field with content moderation
 */
async function validateAndSanitizeBio(rawBio: string | null, userId: string) {
    if (rawBio === null || rawBio === '') {
        return { valid: true, sanitized: null }
    }

    const validation = bioFieldSchema.safeParse(rawBio)
    if (!validation.success) {
        return {
            valid: false,
            error: validation.error.issues.map(i => i.message).join(', ')
        }
    }

    const sanitization = sanitizeBio(rawBio)
    if (!sanitization.isValid) {
        return { valid: false, error: sanitization.error || 'Invalid bio format' }
    }

    const sanitizedBio = sanitization.sanitized

    // Content moderation check
    const contentValidation = validateContent(sanitizedBio, {
        minLength: 0,
        maxLength: 1000,
        checkProfanity: true,
        checkHateSpeech: true,
        checkPii: true
    })

    if (!contentValidation.valid) {
        logger.warn('Profile bio rejected by content filter', {
            userId,
            errors: contentValidation.errors
        })
        return {
            valid: false,
            error: `Bio content rejected: ${contentValidation.errors.join(', ')}`
        }
    }

    // Apply content filtering
    const filterResult = filterContent(sanitizedBio)

    return {
        valid: true,
        sanitized: filterResult.sanitizedContent || sanitizedBio
    }
}

/**
 * Validate password change
 */
async function validatePasswordChange(
    currentPassword: string,
    newPassword: string,
    userId: string
) {
    if (!currentPassword || !newPassword) {
        throw new ValidationError('Both current and new password are required')
    }

    if (currentPassword === newPassword) {
        throw new ValidationError('New password must be different from current password')
    }

    if (newPassword.length < 8) {
        throw new ValidationError('Password must be at least 8 characters')
    }

    const userRecord = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, password: true }
    })

    if (!userRecord || !userRecord.password) {
        throw new NotFoundError('User')
    }

    const isMatch = await bcrypt.compare(currentPassword, userRecord.password)
    if (!isMatch) {
        throw new ValidationError('Current password is incorrect')
    }

    return true
}

/**
 * DEPRECATED: University validation removed
 */
async function validateUniversityChange() {
    throw new Error('University management has been removed')
}

/**
 * Get authenticated user ID
 */
async function getAuthenticatedUserId() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        throw new AuthenticationError()
    }
    return session.user.id
}

/**
 * Update user's basic profile information
 */
export async function updateUserProfile(
    fullName: string,
    bio: string
) {
    try {
        const userId = await getAuthenticatedUserId()

        // Validate and sanitize name
        const nameValidation = validateAndSanitizeName(fullName)
        if (!nameValidation.valid) {
            return { success: false, error: nameValidation.error || 'Invalid name' }
        }

        // Validate and sanitize bio
        const bioValidation = await validateAndSanitizeBio(bio, userId)
        if (!bioValidation.valid) {
            return { success: false, error: bioValidation.error || 'Invalid bio' }
        }

        // Split name into first and last
        const nameParts = nameValidation.sanitized.trim().split(/\s+/)
        const firstName = nameParts[0] || ''
        const lastName = nameParts.slice(1).join(' ') || ''

        // Update profile
        await prisma.user.update({
            where: { id: userId },
            data: {
                fullName: nameValidation.sanitized,
                firstName,
                lastName,
                bio: bioValidation.sanitized
            }
        })

        revalidatePath('/profile')
        revalidatePath('/profile/settings')

        return { success: true }
    } catch (error) {
        logger.error('Failed to update profile', { error })
        return { success: false, error: error instanceof Error ? error.message : 'Failed to update profile' }
    }
}

/**
 * Change user's password
 */
export async function changePassword(
    currentPassword: string,
    newPassword: string
) {
    try {
        const userId = await getAuthenticatedUserId()

        await validatePasswordChange(currentPassword, newPassword, userId)

        const hashedPassword = await bcrypt.hash(newPassword, 10)

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        })

        revalidatePath('/profile/settings')

        return { success: true, message: 'Password changed successfully' }
    } catch (error) {
        logger.error('Failed to change password', { error })
        return { success: false, error: error instanceof Error ? error.message : 'Failed to change password' }
    }
}

/**
 * Request email verification resend
 */
export async function resendVerification() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        throw new AuthenticationError()
    }

    const userId = session.user.id

    const userRecord = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, emailVerified: true, email: true, fullName: true, verificationToken: true }
    })

    if (!userRecord) {
        throw new NotFoundError('User')
    }

    if (userRecord.emailVerified) {
        throw new ValidationError('Email is already verified')
    }

    const { sendVerificationEmail } = await import('@/lib/email/send')
    const token = userRecord.verificationToken

    if (!token) {
        const verificationToken = crypto.randomUUID()
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)

        await prisma.user.update({
            where: { id: userId },
            data: { verificationToken, verificationExpires }
        })

        const email = userRecord.email ?? ''
        const fullName = userRecord.fullName ?? ''
        sendVerificationEmail(email, fullName, verificationToken)
            .catch(err => logger.error('Failed to send verification email', { error: err }))
    } else {
        const email = userRecord.email ?? ''
        const fullName = userRecord.fullName ?? ''
        sendVerificationEmail(email, fullName, token)
            .catch(err => logger.error('Failed to send verification email', { error: err }))
    }

    return { success: true, message: 'Verification email sent' }
}

/**
 * DEPRECATED: University management has been removed
 * University is now just a string field on User
 */
export async function setPrimaryUniversity() {
    throw new Error('University management has been removed')
}

export async function addSecondaryUniversity() {
    throw new Error('Secondary university feature has been removed')
}

export async function removeSecondaryUniversity() {
    throw new Error('Secondary university feature has been removed')
}

/**
 * Toggle public profile visibility
 */
/**
 * Update user's linking info (LinkedIn, Website)
 */
export async function updateProfileLinks(linkedinUrl: string, personalWebsite: string) {
    const userId = await getAuthenticatedUserId()

    // Basic validation
    if (linkedinUrl && !linkedinUrl.includes('linkedin.com')) {
        return { error: 'Invalid LinkedIn URL' }
    }

    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                linkedinUrl: linkedinUrl || null,
                personalWebsite: personalWebsite || null
            }
        })
        revalidatePath('/profile')
        return { success: true }
    } catch (error) {
        logger.error('Failed to update profile links', { userId, error })
        return { error: 'Failed to update links' }
    }
}

/**
 * Delete user account
 */
export async function deleteAccount(currentPassword: string) {
    const userId = await getAuthenticatedUserId()

    const userRecord = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, password: true }
    })

    if (!userRecord || !userRecord.password) {
        throw new ValidationError('User not found or has no password')
    }

    const isMatch = await bcrypt.compare(currentPassword, userRecord.password)
    if (!isMatch) {
        throw new ValidationError('Current password is incorrect')
    }

    await prisma.user.delete({
        where: { id: userId }
    })

    return { success: true }
}
