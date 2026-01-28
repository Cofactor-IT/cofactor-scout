'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import bcrypt from 'bcryptjs'

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
}

/**
 * Update user's profile information (name and bio)
 */
export async function updateUserProfile(name: string, bio: string) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return { error: 'You must be logged in' }
    }

    if (!name?.trim()) {
        return { error: 'Name is required' }
    }

    if (name.trim().length < 2) {
        return { error: 'Name must be at least 2 characters' }
    }

    if (name.trim().length > 100) {
        return { error: 'Name must be less than 100 characters' }
    }

    if (bio && bio.length > 1000) {
        return { error: 'Bio must be less than 1000 characters' }
    }

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                name: name.trim(),
                bio: bio?.trim() || null
            }
        })

        revalidatePath('/profile')
        revalidatePath('/profile/settings')
        return { success: true }
    } catch (error) {
        console.error('Failed to update profile:', error)
        return { error: 'Failed to update profile. Please try again.' }
    }
}

/**
 * Change user's password
 */
export async function changePassword(currentPassword: string, newPassword: string) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return { error: 'You must be logged in' }
    }

    if (!currentPassword || !newPassword) {
        return { error: 'Both current and new password are required' }
    }

    // Fetch user with password
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { password: true }
    })

    if (!user?.password) {
        return { error: 'Cannot change password for accounts without a password set' }
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password)
    if (!isValid) {
        return { error: 'Current password is incorrect' }
    }

    // Validate new password complexity (same as signup and reset)
    if (newPassword.length < 8) {
        return { error: 'New password must be at least 8 characters' }
    }
    if (!/[A-Z]/.test(newPassword)) {
        return { error: 'New password must contain at least one uppercase letter' }
    }
    if (!/[a-z]/.test(newPassword)) {
        return { error: 'New password must contain at least one lowercase letter' }
    }
    if (!/[0-9]/.test(newPassword)) {
        return { error: 'New password must contain at least one number' }
    }
    if (!/[^A-Za-z0-9]/.test(newPassword)) {
        return { error: 'New password must contain at least one special character' }
    }

    // Hash and save new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: { password: hashedPassword }
        })

        revalidatePath('/profile/settings')
        return { success: true, message: 'Password changed successfully' }
    } catch (error) {
        console.error('Failed to change password:', error)
        return { error: 'Failed to change password. Please try again.' }
    }
}

/**
 * Toggle public profile and update Person record
 */
export async function updatePublicProfile(
    isPublic: boolean,
    profileData?: {
        role?: string
        fieldOfStudy?: string
        bio?: string
        linkedin?: string
        twitter?: string
        website?: string
        instituteId?: string
        labId?: string
    }
) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return { error: 'You must be logged in' }
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            name: true,
            email: true,
            publicPersonId: true,
            universityId: true
        }
    })

    if (!user) {
        return { error: 'User not found' }
    }

    try {
        if (isPublic) {
            // Creating or updating public profile
            if (!user.name) {
                return { error: 'You must set a display name before creating a public profile' }
            }

            // Generate a unique slug
            let baseSlug = generateSlug(user.name)
            let slug = baseSlug
            let counter = 1

            while (true) {
                const existing = await prisma.person.findUnique({
                    where: { slug },
                    select: { id: true }
                })
                if (!existing || (user.publicPersonId && existing.id === user.publicPersonId)) {
                    break
                }
                slug = `${baseSlug}-${counter}`
                counter++
            }

            if (user.publicPersonId) {
                // Update existing Person record
                await prisma.person.update({
                    where: { id: user.publicPersonId },
                    data: {
                        name: user.name,
                        slug,
                        role: profileData?.role || null,
                        fieldOfStudy: profileData?.fieldOfStudy || null,
                        bio: profileData?.bio || null,
                        linkedin: profileData?.linkedin || null,
                        twitter: profileData?.twitter || null,
                        website: profileData?.website || null,
                        email: user.email,
                        instituteId: profileData?.instituteId || null,
                        labId: profileData?.labId || null
                    }
                })

                await prisma.user.update({
                    where: { id: user.id },
                    data: { isPublicProfile: true }
                })
            } else {
                // Create new Person record and link to user
                const person = await prisma.person.create({
                    data: {
                        name: user.name,
                        slug,
                        role: profileData?.role || null,
                        fieldOfStudy: profileData?.fieldOfStudy || null,
                        bio: profileData?.bio || null,
                        linkedin: profileData?.linkedin || null,
                        twitter: profileData?.twitter || null,
                        website: profileData?.website || null,
                        email: user.email,
                        instituteId: profileData?.instituteId || null,
                        labId: profileData?.labId || null
                    }
                })

                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        isPublicProfile: true,
                        publicPersonId: person.id
                    }
                })
            }
        } else {
            // Disabling public profile (but keeping the Person record)
            await prisma.user.update({
                where: { id: user.id },
                data: { isPublicProfile: false }
            })
        }

        revalidatePath('/profile')
        revalidatePath('/profile/settings')
        return { success: true }
    } catch (error) {
        console.error('Failed to update public profile:', error)
        return { error: 'Failed to update public profile. Please try again.' }
    }
}

/**
 * Get institutes for the user's university
 */
export async function getInstitutesForUser() {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return []
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { universityId: true, secondaryUniversityId: true }
    })

    if (!user?.universityId) {
        return []
    }

    // Get institutes from both primary and secondary universities
    const universityIds = [user.universityId]
    if (user.secondaryUniversityId) {
        universityIds.push(user.secondaryUniversityId)
    }

    return prisma.institute.findMany({
        where: {
            universityId: { in: universityIds },
            approved: true
        },
        orderBy: { name: 'asc' },
        select: {
            id: true,
            name: true,
            universityId: true
        }
    })
}

/**
 * Get labs for a specific institute
 */
export async function getLabsForInstitute(instituteId: string) {
    if (!instituteId) {
        return []
    }

    return prisma.lab.findMany({
        where: {
            instituteId,
            approved: true
        },
        orderBy: { name: 'asc' },
        select: {
            id: true,
            name: true
        }
    })
}

/**
 * Get current user's public profile data
 */
export async function getCurrentPublicProfile() {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return null
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            isPublicProfile: true,
            publicPerson: {
                select: {
                    id: true,
                    role: true,
                    fieldOfStudy: true,
                    bio: true,
                    linkedin: true,
                    twitter: true,
                    website: true,
                    instituteId: true,
                    labId: true
                }
            }
        }
    })

    return user
}
