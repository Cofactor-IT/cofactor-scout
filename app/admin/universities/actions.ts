'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth'

/**
 * Create a new university - ADMIN ONLY
 */
export async function createUniversity(prevState: { error?: string } | undefined, formData: FormData) {
    await requireAdmin()

    const name = formData.get('name') as string
    if (!name?.trim()) {
        return { error: 'University name is required' }
    }

    // Collect all domains from form data
    const domains: string[] = []
    for (const [key, value] of formData.entries()) {
        if (key.startsWith('domain_') && typeof value === 'string' && value.trim()) {
            domains.push(value.trim().toLowerCase())
        }
    }

    if (domains.length === 0) {
        return { error: 'At least one email domain is required' }
    }

    // Check for duplicate university name
    const existingName = await prisma.university.findUnique({
        where: { name: name.trim() }
    })
    if (existingName) {
        return { error: 'A university with this name already exists' }
    }

    // Check for duplicate domains
    for (const domain of domains) {
        const existingDomain = await prisma.university.findFirst({
            where: {
                domains: { has: domain }
            }
        })
        if (existingDomain) {
            return { error: `Domain "${domain}" is already registered to ${existingDomain.name}` }
        }
    }

    await prisma.university.create({
        data: {
            name: name.trim(),
            domains,
            approved: true
        }
    })

    revalidatePath('/admin/universities')
    return { error: undefined }
}

/**
 * Delete a university - ADMIN ONLY
 */
export async function deleteUniversity(universityId: string) {
    await requireAdmin()

    // First, unlink all users from this university
    await prisma.user.updateMany({
        where: { universityId },
        data: { universityId: null }
    })

    // Then delete the university
    await prisma.university.delete({
        where: { id: universityId }
    })

    revalidatePath('/admin/universities')
    revalidatePath('/admin/dashboard')
}

/**
 * Approve a user-suggested university - ADMIN ONLY
 */
export async function approveUniversity(universityId: string) {
    await requireAdmin()

    await prisma.university.update({
        where: { id: universityId },
        data: { approved: true }
    })

    revalidatePath('/admin/universities')
    revalidatePath('/admin/dashboard')
}

/**
 * Update a university - ADMIN ONLY
 */
export async function updateUniversity(universityId: string, name: string, domains: string[]) {
    await requireAdmin()

    if (!name?.trim()) {
        throw new Error('University name is required')
    }

    if (domains.length === 0) {
        throw new Error('At least one email domain is required')
    }

    // Check for duplicate name (excluding current university)
    const existingName = await prisma.university.findFirst({
        where: {
            name: name.trim(),
            NOT: { id: universityId }
        }
    })
    if (existingName) {
        throw new Error('A university with this name already exists')
    }

    // Check for duplicate domains (excluding current university)
    for (const domain of domains) {
        const existingDomain = await prisma.university.findFirst({
            where: {
                domains: { has: domain.toLowerCase() },
                NOT: { id: universityId }
            }
        })
        if (existingDomain) {
            throw new Error(`Domain "${domain}" is already registered to ${existingDomain.name}`)
        }
    }

    await prisma.university.update({
        where: { id: universityId },
        data: {
            name: name.trim(),
            domains: domains.map(d => d.toLowerCase())
        }
    })

    revalidatePath('/admin/universities')
}
