'use server'

import { prisma } from '@/lib/database/prisma'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import bcrypt from 'bcryptjs'
import {
    profileUpdateSchema,
    publicProfileUpdateSchema,
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
 * Validate university affiliation changes
 */
async function validateUniversityChange(
    universityId: string | null,
    userId: string
) {
    if (!universityId) {
        return true
    }

    const university = await prisma.university.findUnique({
        where: { id: universityId },
        select: { id: true, approved: true }
    })

    if (!university) {
        throw new NotFoundError('University', universityId)
    }

    if (!university.approved) {
        throw new ValidationError('Cannot join an unapproved university')
    }

    return true
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
    name: string,
    bio: string
) {
    try {
        const userId = await getAuthenticatedUserId()

        // Validate and sanitize name
        const nameValidation = validateAndSanitizeName(name)
        if (!nameValidation.valid) {
            return { success: false, error: nameValidation.error || 'Invalid name' }
        }

        // Validate and sanitize bio
        const bioValidation = await validateAndSanitizeBio(bio, userId)
        if (!bioValidation.valid) {
            return { success: false, error: bioValidation.error || 'Invalid bio' }
        }

        // Update profile
        await prisma.user.update({
            where: { id: userId },
            data: {
                name: nameValidation.sanitized,
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
        select: { id: true, emailVerified: true, email: true, name: true, verificationToken: true }
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
        const name = userRecord.name ?? ''
        sendVerificationEmail(email, name, verificationToken)
            .catch(err => logger.error('Failed to send verification email', { error: err }))
    } else {
        const email = userRecord.email ?? ''
        const name = userRecord.name ?? ''
        sendVerificationEmail(email, name, token)
            .catch(err => logger.error('Failed to send verification email', { error: err }))
    }

    return { success: true, message: 'Verification email sent' }
}

/**
 * Set primary university
 */
export async function setPrimaryUniversity(universityId: string) {
    const userId = await getAuthenticatedUserId()

    await validateUniversityChange(universityId, userId)

    await prisma.user.update({
        where: { id: userId },
        data: { universityId }
    })

    revalidatePath('/profile')

    return { success: true }
}

/**
 * Add secondary university
 */
export async function addSecondaryUniversity(universityId: string) {
    const userId = await getAuthenticatedUserId()

    const userRecord = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, secondaryUniversityId: true }
    })

    if (!userRecord) {
        throw new NotFoundError('User')
    }

    if (userRecord.secondaryUniversityId) {
        throw new ValidationError('You already have a secondary university')
    }

    await validateUniversityChange(universityId, userId)

    await prisma.user.update({
        where: { id: userId },
        data: { secondaryUniversityId: universityId }
    })

    revalidatePath('/profile')

    return { success: true }
}

/**
 * Remove secondary university
 */
export async function removeSecondaryUniversity() {
    const userId = await getAuthenticatedUserId()

    await prisma.user.update({
        where: { id: userId },
        data: { secondaryUniversityId: null }
    })

    revalidatePath('/profile')

    return { success: true }
}

/**
 * Toggle public profile visibility
 */
export async function togglePublicProfile() {
    const userId = await getAuthenticatedUserId()

    const userRecord = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            isPublicProfile: true,
            publicPersonId: true
        }
    })

    if (!userRecord) {
        throw new NotFoundError('User')
    }

    if (userRecord.isPublicProfile) {
        // Make private - unlink person record
        if (userRecord.publicPersonId) {
            await prisma.person.update({
                where: { id: userRecord.publicPersonId },
                data: { linkedUser: { disconnect: true } }
            })
        }

        await prisma.user.update({
            where: { id: userId },
            data: {
                isPublicProfile: false,
                publicPersonId: null
            }
        })
    } else {
        // Make public - need a person record or create one
        const userProfile = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, bio: true }
        })

        if (!userProfile) {
            throw new NotFoundError('User')
        }

        if (!userRecord.publicPersonId) {
            const person = await prisma.person.create({
                data: {
                    name: userProfile.name || '',
                    bio: userProfile.bio || ''
                }
            })

            await prisma.user.update({
                where: { id: userId },
                data: {
                    isPublicProfile: true,
                    publicPersonId: person.id
                }
            })
        } else {
            await prisma.user.update({
                where: { id: userId },
                data: { isPublicProfile: true }
            })
        }
    }

    revalidatePath('/profile')

    return { success: true }
}

/**
 * Update public profile settings
 */
export async function updatePublicProfileSettings(formData: FormData) {
    const userId = await getAuthenticatedUserId()

    const userRecord = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, publicPersonId: true }
    })

    if (!userRecord || !userRecord.publicPersonId) {
        throw new ValidationError('No public profile found')
    }

    // Extract and validate form data
    const name = formData.get('name') as string
    const role = formData.get('role') as string
    const fieldOfStudy = formData.get('fieldOfStudy') as string
    const bio = formData.get('bio') as string
    const linkedin = formData.get('linkedin') as string
    const twitter = formData.get('twitter') as string
    const website = formData.get('website') as string

    const validation = publicProfileUpdateSchema.safeParse({
        name, role, fieldOfStudy, bio, linkedin, twitter, website
    })

    if (!validation.success) {
        throw new ValidationError(validation.error.issues.map(i => i.message).join(', '))
    }

    await prisma.person.update({
        where: { id: userRecord.publicPersonId },
        data: validation.data
    })

    revalidatePath('/profile')

    return { success: true }
}

/**
 * Get all approved institutes
 */
export async function getInstitutesForUser() {
    const institutes = await prisma.institute.findMany({
        where: { approved: true },
        select: { id: true, name: true },
        orderBy: { name: 'asc' }
    })
    return institutes
}

/**
 * Get labs for a specific institute
 */
export async function getLabsForInstitute(instituteId: string) {
    if (!instituteId) return []

    const labs = await prisma.lab.findMany({
        where: { instituteId, approved: true },
        select: { id: true, name: true },
        orderBy: { name: 'asc' }
    })
    return labs
}

interface PublicProfileData {
    role?: string | null
    fieldOfStudy?: string | null
    bio?: string | null
    linkedin?: string | null
    twitter?: string | null
    website?: string | null
    instituteId?: string | null
    labId?: string | null
}

/**
 * Update public profile (visibility and data)
 */
export async function updatePublicProfile(isPublic: boolean, data?: PublicProfileData) {
    const userId = await getAuthenticatedUserId()

    try {
        if (!isPublic) {
            // Disable public profile
            await prisma.user.update({
                where: { id: userId },
                data: { isPublicProfile: false }
            })
            revalidatePath('/profile/settings')
            return { success: true }
        }

        // Enable and update public profile
        // 1. Ensure Person record exists
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, bio: true, publicPersonId: true }
        })

        if (!user) throw new NotFoundError('User')

        let personId = user.publicPersonId

        if (!personId) {
            // Create new person record
            const person = await prisma.person.create({
                data: {
                    name: user.name || 'Anonymous',
                    bio: user.bio || '',
                    slug: generateSlug(user.name || 'anonymous') + '-' + Math.random().toString(36).substring(2, 6)
                }
            })
            personId = person.id

            await prisma.user.update({
                where: { id: userId },
                data: { publicPersonId: person.id }
            })
        }

        // 2. Update Person record with provided data if any
        if (data) {
            // Validate stats? Relying on partial updates for now as per UI
            await prisma.person.update({
                where: { id: personId },
                data: {
                    role: data.role,
                    fieldOfStudy: data.fieldOfStudy,
                    bio: data.bio,
                    linkedin: data.linkedin,
                    twitter: data.twitter,
                    website: data.website,
                    instituteId: data.instituteId,
                    labId: data.labId
                }
            })
        }

        // 3. Set isPublicProfile to true
        await prisma.user.update({
            where: { id: userId },
            data: { isPublicProfile: true }
        })

        revalidatePath('/profile/settings')
        return { success: true }

    } catch (error) {
        logger.error('Failed to update public profile', { userId, error })
        return { error: 'Failed to update public profile' }
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
